const TelegramBot = require('node-telegram-bot-api')
const config = require('config')
const express = require('express');
const { get } = require('config');
const b24 = require('b24');
const app = express();
const bitrix24 = new b24.Bitrix24({
    config: {
        mode: "webhook",
        host: "https://b24-kw0ma7.bitrix24.ru",
        user_id: "1",
        code: "df4lf2cgqrwv0ace"
    }
}) 
//Тут константы Битрикс24, а именно - статусы сделок в Битрикс
const takeTaskStatusId = 2; // Задача принята
const refuseToTakeTaskStatusId = 1;  // От задачи отказались
const sentToCheckStatusId = 3;  //  Задачу отправили на проверку. 

// Справочник сопоставления элементов Б24. 


const multyListElements = [
    {'id':'50','value':'Элемент 1 '},
    {'id':'52','value':'Элемент 2 '}
]


// res.result.UF_CRM_1602334412040


// Тут функции пока что 
async function getDealData(id) {
    try {
        const result = await bitrix24.callMethod('crm.deal.get', {id:id})
        return result
    } catch (error) {
        console.log(error);
    }

}

async function changeDealStatus(dealId, newStatus) {
    try {
        const result = await bitrix24.callMethod('crm.deal.update', {id: dealId, fields: {
            "STAGE_ID": newStatus
        }})

        // const result = await bitrix24.callMethod("crm.deal.update", {id:2, fields:{"TITLE":"TITI"}})
        return result
    } catch (error) {
        console.log(error);
    }
    
}
//
// df4lf2cgqrwv0ace
// sejiy77372@septicvernon.com 
// septicvernon 
// https://b24-kw0ma7.bitrix24.ru/stream/?current_fieldset=SOCSERV

const TOKEN = config.get('token')
const bot = new TelegramBot(TOKEN, {polling: true})

app.listen(3000);
app.get('/', (res, req) => {
    console.log(res);
})


app.get('/createtask/:id', (req, res) => {

   

   try {

    getDealData(req.params.id).then(res => {
    

        const elementsListValues = res.result.UF_CRM_1602334412040.map(el => {
      
        let allVallues = []
        multyListElements.forEach(element => {
                if (element.id == el) {
                   allVallues.push(element.value)
                }
            });
            return allVallues
         }) 
        bot.sendMessage('-475117341', `Задача номер ${res.result.ID} \nDeadline: ${res.result.UF_CRM_1602334191383.substr(0,10)} \nList element: ${elementsListValues} \n `, {
            reply_markup: {
                inline_keyboard : [
                    [
                        {
                            text: `Принять задачу`,
                            callback_data: JSON.stringify({
                                button: `take_task`,
                                b24dealId: `${res.result.ID}`
                            })
                        }, 
                        {
                            text: `Отказаться от задачи`,
                            callback_data: JSON.stringify({
                                button: `refuse_to_take_task`,
                                b24dealId: `${res.result.ID}`
                            })
                        }
                    ]
                ]
            }
        })
    })
    res.sendStatus(200);
   } catch (error) {
       console.log(error);
       res.sendStatus(503);
   }

    
    
    
})

bot.on('callback_query', query => {
    const {message: {chat, message_id, text}} = query 
    let queryData = JSON.parse(query.data)
    // console.log(queryData);
    switch (queryData.button) {
        case 'take_task':
            changeDealStatus(queryData.b24dealId, takeTaskStatusId).then(res => console.log(res))
            bot.editMessageText(`Задача принята`, {
                chat_id:chat.id,
                message_id:message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Отправить на проверку`,
                                callback_data: JSON.stringify({
                                    button: `sent_to_check`,
                                    b24dealId: `${queryData.b24dealId}`
                                })
                                
                            }
                        ]
                    ]
                } 
            })
            break;
        case 'refuse_to_take_task': 
        changeDealStatus(queryData.b24dealId, refuseToTakeTaskStatusId).then(res => console.log(res))
            bot.editMessageText('Отказались от задачи', {
                chat_id:chat.id,
                message_id:message_id
            })
            
            break;
        case 'sent_to_check': 
            // console.log(queryData);
            changeDealStatus(queryData.b24dealId, sentToCheckStatusId).then(res => console.log(res))
            bot.editMessageText('Задача отправлена на доработку', {
                chat_id:chat.id,
                message_id:message_id
            })
           
    }

})
bot.on("polling_error", console.log);
bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, 'Ваши задачи!')
    
});








