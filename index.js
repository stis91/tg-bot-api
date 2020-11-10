const TelegramBot = require('node-telegram-bot-api')
const config = require('config')
const express = require('express');
const { get } = require('config');
const b24 = require('b24');
const c = require('config');
const app = express();
const bitrix24 = new b24.Bitrix24({
    config: {
        mode: "webhook",
        host: "https://b24-kqfmgr.bitrix24.ru",
        user_id: "1",
        code: "2e7k3ydn2201tcrp"
    }
}) 
//Тут константы Битрикс24, а именно - статусы сделок в Битрикс
const takeTaskStatusId = 'C3:PREPAYMENT_INVOICE'; // Задача принята
const refuseToTakeTaskStatusId = 'C3:NEW';  // От задачи отказались и она попала в бэклог
const sentToCheckStatusId = 'C3:EXECUTING';  //  Задачу отправили на проверку. 




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

        return result
    } catch (error) {
        console.log(error);
    }
    
}


const TOKEN = config.get('token')
const bot = new TelegramBot(TOKEN, {polling: true})

app.listen(3000);

app.all('/createtask/:id', (req, res) => {

   

   try {

    getDealData(req.params.id).then(res => {

        let date = new Date(res.result.UF_CRM_1603984090)
        let day = '';
        if (isNaN(date.getDate())) {
             day = 'Крайний срок не установлен'
        } else {
           
            let minutes = date.getMinutes()<10?'00':'' + date.getMinutes()
             day = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} в ${date.getHours()}:${minutes}`
        }
        
        let bx24chat_id = res.result.UF_CRM_1604751839
  
        bot.sendMessage(bx24chat_id, `Задача номер ${res.result.ID} \nПартия: ${res.result.TITLE} \nDeadline: ${day} \n `, {
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
 
    switch (queryData.button) {
        case 'take_task':
            changeDealStatus(queryData.b24dealId, takeTaskStatusId).then(res => console.log(res, 'res!'))
            bot.editMessageText(`${text} \n\nЗадача принята`, {
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
            bot.editMessageText(`${text} \n\nЗадача отклонена`, {
                chat_id:chat.id,
                message_id:message_id
            })
            
            break;
        case 'sent_to_check': 
            changeDealStatus(queryData.b24dealId, sentToCheckStatusId).then(res => console.log(res))
            bot.editMessageText(`${text} \n\nЗадача отправлена на проверку`, {
                chat_id:chat.id,
                message_id:message_id
            })
           
    }

})


bot.onText(new RegExp('/CRM'), msg => {
    console.log('Словили сообщение');
    bot.sendMessage(msg.chat.id, `ID чата: \n ${msg.chat.id}`)

} )


bot.on("polling_error", console.log);







