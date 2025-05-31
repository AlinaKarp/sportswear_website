async function loginUser(email, password) {
    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log(data); // Здесь будет токен или сообщение об ошибке
}

// Вызов функции авторизации
loginUser('test@example.com', '123456');
