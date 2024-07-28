const https = require('https');

const token = 'YOUR_TOKEN_HERE'; //or you can use env. I'm not doing here cuz lazy...
const apiUrl = `https://api.telegram.org/bot${token}/test`;

//send a request to the Telegram API
function sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
        const url = `${apiUrl}/${method}`;
        const postData = JSON.stringify(params);
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

//get updates
function getUpdates(offset) {
    return sendRequest('getUpdates', { offset });
}

//send a message
function sendMessage(chatId, text) {
    return sendRequest('sendMessage', {
        chat_id: chatId,
        text: `\`\`\`\n${text}\n\`\`\``,
        parse_mode: 'MarkdownV2'
    });
}

//handle commands
function handleCommand(command, chatId) {
    if (command === '/code') {
        const githubLink = 'https://github.com/your-repository';
        return sendRequest('sendMessage', {
            chat_id: chatId,
            text: `Here is the GitHub link: [GitHub Repository](${githubLink})`,
            parse_mode: 'MarkdownV2'
        });
    }
    return null;
}

//to handle updates
async function handleUpdates() {
    let offset = 0;

    while (true) {
        try {
            const updates = await getUpdates(offset);

            for (const update of updates.result) {
                const chatId = update.message.chat.id;
                const text = update.message.text;

                if (text.startsWith('/')) {
                    await handleCommand(text, chatId);
                } else {
                    await sendMessage(chatId, JSON.stringify(update, null, 2));
                }

                offset = update.update_id + 1;
            }
        } catch (error) {
            console.error('Error:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every second
    }
}

//start handling updates
handleUpdates();
console.clear();
console.log('Bot is running on test server.');
