from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import json

app = FastAPI()

# Модели данных
class User(BaseModel):
    email: str
    password: str

class Product(BaseModel):
    name: str
    description: str
    price: str
    image: str
    category: str

class CartItem(BaseModel):
    id: str
    name: str
    price: str
    quantity: int

# База данных в JSON файлах
DB_FILES = {
    "users": "users.json",
    "products": "products.json",
    "cart": "cart.json",
    "reviews": "reviews.json"
}

# Инициализация файлов БД
for db_file in DB_FILES.values():
    if not os.path.exists(db_file):
        with open(db_file, "w") as f:
            json.dump([], f)

# Функции работы с БД
def read_db(db_name: str):
    with open(DB_FILES[db_name], "r") as f:
        return json.load(f)

def write_db(db_name: str, data):
    with open(DB_FILES[db_name], "w") as f:
        json.dump(data, f, indent=2)

# API Endpoints
@app.post("/api/register")
async def register(user: User):
    users = read_db("users")
    
    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    users.append({
        "email": user.email,
        "password": user.password,
        "role": "user"
    })
    
    write_db("users", users)
    return {"message": "Пользователь успешно зарегистрирован"}

@app.post("/api/login")
async def login(user: User):
    users = read_db("users")
    
    for u in users:
        if u["email"] == user.email and u["password"] == user.password:
            return {"message": "Успешный вход", "email": user.email}
    
    raise HTTPException(status_code=401, detail="Неверные учетные данные")

@app.get("/api/products")
async def get_products(category: str = None):
    products = read_db("products")
    if category:
        return [p for p in products if p["category"] == category]
    return products

@app.post("/api/products")
async def add_product(product: Product):
    products = read_db("products")
    
    # Генерируем ID
    new_id = max([p["id"] for p in products], default=0) + 1
    
    products.append({
        "id": new_id,
        **product.dict()
    })
    
    write_db("products", products)
    return {"message": "Товар добавлен"}

@app.post("/api/cart")
async def add_to_cart(item: CartItem):
    cart = read_db("cart")
    cart.append(item.dict())
    write_db("cart", cart)
    return {"message": "Товар добавлен в корзину"}

@app.get("/api/cart")
async def get_cart():
    return read_db("cart")

@app.post("/api/reviews")
async def add_review(review: dict):
    reviews = read_db("reviews")
    reviews.append(review)
    write_db("reviews", reviews)
    return {"message": "Отзыв добавлен"}

@app.get("/api/reviews")
async def get_reviews():
    return read_db("reviews")

# Статические файлы (CSS, JS, изображения)
app.mount("/static", StaticFiles(directory="."), name="static")

# Обработка HTML страниц
@app.get("/{path:path}")
async def serve_html(request: Request, path: str):
    # Проверяем существование файла
    file_path = f"./{path}"
    
    # Если запрос к корню
    if path == "":
        return FileResponse("index.html")
    
    # Если запрошенный файл существует
    if os.path.isfile(file_path) and file_path.endswith((".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif")):
        return FileResponse(file_path)
    
    # Если это путь к HTML странице без расширения
    if os.path.isfile(file_path + ".html"):
        return FileResponse(file_path + ".html")
    
    # Если файл не найден
    if os.path.isfile("index.html"):
        return FileResponse("index.html")
    
    raise HTTPException(status_code=404, detail="Страница не найдена")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)