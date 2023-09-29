const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const micBtn = document.querySelector(".chat-input a");

let userMessage = null; // Variable to store user's message
const API_KEY = "f081c49f3a584eb383dbdcfe3e5b4602"; // Paste your API key here
let inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}
const runSpeechRecognition = (chatbox) => {
    let chatmessage = chatbox.querySelector('.chatbox__messages');
        // get output div reference
        var output = document.getElementById("output");
        // get action element reference
        var action = document.getElementById("action");
        // new speech recognition object
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var recognition = new SpeechRecognition();

        // This runs when the speech recognition service starts
        recognition.onstart = function() {
           // action.innerHTML = "<small>listening, please speak...</small>";

        };

        recognition.onspeechend = function() {
            //action.innerHTML = "<small>stopped listening, hope you are done...</small>";
            recognition.stop();
        }

        let chatContent = this.getChatContent();
        let that = this;

        // This runs when the speech recognition service returns result
        recognition.onresult = function(event) {
            var transcript = event.results[0][0].transcript;
            var confidence = event.results[0][0].confidence;

            chatContent = "\n" + transcript;

            let html = '<div class="messages__item messages__item--operator">' + transcript + '</div>'
            chatmessage.innerHTML = html;
            that.onSendButton(chatbox, transcript);
            // output.innerHTML = "<b>Text: </b> " + transcript; // + "<br/> <b>Confidence:</b> " + confidence*100+"%";
            // output.classList.remove("hide");

        };

         // start recognition
         recognition.start();
}

const generateResponse = (chatElement) => {
    const API_URL = "https://personalised-product-recommender.openai.azure.com/openai/deployments/coreui-test/completions?api-version=2023-05-15";
    const messageElement = chatElement.querySelector("p");
    const formattedChatInput = `Human: ${userMessage}\nAI:`;
    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": `${API_KEY}`,
            "model": "gpt-3.5-turbo"
        },
        body: JSON.stringify({
            prompt: formattedChatInput,
            "temperature": 1,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "max_tokens": 256,
            "stop": [
                "Human:",
                "AI:"
              ]
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        messageElement.textContent = data.choices[0].text.trim();
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    if(!inputInitHeight)
        inputInitHeight = chatInput.scrollHeight;
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});



sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
micBtn.addEventListener("click", () => runSpeechRecognition(chatbox));