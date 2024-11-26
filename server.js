const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Настройка парсинга JSON и URL-encoded данных
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Подключение к базе данных PostgreSQL
const client = new Client({
  host: '16.171.7.223', // IP вашего сервера
  port: 5432,
  user: 'my_user',  // Ваше имя пользователя
  password: 'my_password',  // Ваш пароль
  database: 'my_database',  // Название базы данных
});

client.connect();

// Отображение формы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

// Отправка данных с формы в БД
app.post('/submit', (req, res) => {
  const { name, email } = req.body;

  const query = 'INSERT INTO users (name, email) VALUES ($1, $2)';
  client.query(query, [name, email], (err, result) => {
    if (err) {
      console.error(err);
      res.send('Ошибка при сохранении данных');
    } else {
      res.redirect('/list');
    }
  });
});

app.get('/list', (req, res) => {
  console.log("Sending list page...");
  const query = 'SELECT * FROM users';
  client.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.send('Ошибка при извлечении данных');
    } else {
      const users = result.rows;
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>List of Users</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h1 class="text-center mt-5">List of Users</h1>
                <table class="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                        </tr>
                    </thead>
                    <tbody>
      `;

      // Добавляем строки таблицы для каждого пользователя
      users.forEach((user, index) => {
        html += `
          <tr>
            <th scope="row">${index + 1}</th>
            <td>${user.name}</td>
            <td>${user.email}</td>
          </tr>
        `;
      });

      html += `
                    </tbody>
                </table>
                <a href="/" class="btn btn-primary mt-3">Back to Form</a>
            </div>
        </body>
        </html>
      `;

      // Отправка сгенерированного HTML
      res.send(html);
    }
  });
});




// Запуск сервера
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});