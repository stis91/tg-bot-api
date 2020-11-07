const TelegramBot = require('node-telegram-bot-api')
const config = require('config')
const { get } = require('config');

// Получить список 
const TOKEN = config.get('token')
const bot = new TelegramBot(TOKEN, {polling: true})

// bot.getMe().then(user => console.log(user))
// bot.getChat('1389886579').then(data => console.log(data))


/* 
Смысл такой:
Когда пользователь выбирает команду - "создать контакт в CRM", - 
Мы получаем его Логин и Чат ИД. 
Битрикс проводит поиск по контакту по полю Логин. 
Если Логин такой есть - он заполняет чат ИД карточку 
Если Логина такого нет - он создает карточку Контакта тоже с чат ИД. 

В итоге, все, что нужно сделать. 



*/