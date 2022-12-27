import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

//To Show Loading or AI is thinking
function loader(element){
    element.textContent = '';
    loadInterval = setInterval(() => {
        element.textContent += '.';

        if(element.textContent === '....'){
            element.textContent = '';
        }
    }, 300) //every 300ms
}

//To Show AI is thinking in real time
function typeText(element, text){
    let index=0;

    let interval=setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        }
        else{
            clearInterval(interval);
        }
    },20) //every 20ms
}

function generateUniqueId() {
    //using current time and date
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAI, value, uniqueID){
    return(
        `
            <div class="wrapper ${isAI && 'ai'}">
                <div class="chat"> 
                    <div class="profile">
                        <img 
                            src="${isAI ? bot : user}"
                            alt="${isAI ? 'bot' : 'user'}"
                        />
                    </div>
                    <div class="message" id=${uniqueID}>${value}</div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async(e) => {
    e.preventDefault();
    const data = new FormData(form);

    //add user chat stripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    form.reset();

    //bot chat stripe
    const uniqueID = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueID);

    loader(messageDiv);

    //fetch data from server (bot's response)
    const response = await fetch('https://bamba-bot.onrender.com/',{
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim();

        //console.log(parsedData)

        typeText(messageDiv, parsedData);
    }
    else{
        const err = await response.text();
        messageDiv.innerHTML = "Something went Wrong!";

        alert(err);
    }

}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        handleSubmit(e);
    }
})