const b24 = require('b24');
const express = require('express');
const app = express()
const bitrix24 = new b24.Bitrix24({
    config: {
        mode: "webhook",
        host: "https://b24-zrzcj8.bitrix24.ru",
        user_id: "1",
        code: "nsvok8o606x934ai"
    }
})


app.get('/allUser', async (req, res) => {
    try{
        const result = await bitrix24.callMethod('user.get');
        return res.json(result);        
    }catch(err){
        console.log(err)
        return res.status(500).json({message:"Internal Server Error"});
    }
})


app.get('/createTask', async (req, res) => {

    // res.send('hi!');
    try {
        const result = await bitrix24.callMethod('crm.deal.add', {
            fields:
            { 
                "TITLE": "Плановая продажа", 
                "STAGE_ID": "NEW", 					
                "OPENED": "Y", 
                "ASSIGNED_BY_ID": 1, 
                "PROBABILITY": 30,
                "CURRENCY_ID": "USD", 
                "OPPORTUNITY": 5000,
                					
            }})
           
            return res.json(result);        
            // console.log(result);
    } catch (error) {
            // console.log(error);
            // return res.status(500).json({message:"Internal Server Error"});

    }

})

app.get('/createDeal/:title/:opp', async (req, res) => {
    try {

        const result = await bitrix24.callMethod('crm.deal.add', {
            fields:
            { 
                "TITLE": req.params['title'], 
                "STAGE_ID": "NEW", 					
                "OPENED": "Y", 
                "ASSIGNED_BY_ID": 1, 
                "PROBABILITY": 30,
                "CURRENCY_ID": "USD", 
                "OPPORTUNITY": req.params['opp'],
                					
            }})
           
            return res.json(result);  
        
    } catch (error) {

       return res.status(500).json({message:"Internal Server Error"});

        
    }
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});

