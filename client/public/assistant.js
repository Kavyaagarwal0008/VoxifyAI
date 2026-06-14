(function() {

    // user data
    const script = document.currentScript;

    const userId =
        script &&
        script.dataset &&
        script.dataset.userId;
    console.log(userId)

    const theme = "dark"
    let assistantConfig = null


    //load css

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "http://localhost:5173/assistant.css"
    document.head.appendChild(link)

    //create pop up
    const popup = document.createElement("div")

    popup.className = `voxify-popup theme-${theme}`
    popup.innerHTML = `
        <div class="voxify-overlay"></div>
        <div class="voxify-content">
            <div class="voxify-top">

                <div class="voxify-orb-wrap">
                    <div class="voxify-orb-glow"></div>
                    <div class="voxify-orb"></div>
                </div>
                <h2 class="voxify-title">Hello I'm Voxify AI</h2>
                <p class="voxify-sub">
                Your smart voice assistant.
                <br/>
                Ask anything about your website.
                </p>

                <div class="voxify-status">Tap button to Speak</div>
                <div class="voxify-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>

                </div>

                <!-- User Text -->
                    <div class="voxify-user-text"></div>
                <!-- AI Text -->
                    <div class="voxify-ai-text"></div>

            </div>

            <div class="voxify-bottom">
                <button class="voxify-mic"> 
                    <img src="http://localhost:5173/mic.svg" alt="mic" class="voxify-mic-icon"/>

                </button>
            </div>
        </div>
        
    `;

    document.body.appendChild(popup);

    // floating button

    const button = document.createElement("button")

    button.className = `voxify-btn theme-${theme}`

    button.innerHTML = `
        <img src="http://localhost:5173/logo.png" alt="logo" />
    `;

    document.body.appendChild(button)

    // toggle popup

    let open = false

    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";
    }


    // Load assistant
    // const loadAssistant = async() => {
    //     try {
    //         const res = await fetch(`http://localhost:8000/api/assistant/config/${userId}`)

    //         const data = await res.json()

    //         console.log(data)

    //         if (data) {
    //             assistantConfig = data.user
    //         }
    //     } catch (error) {

    //         console.log("Assistant Load Error: ", error);

    //     }
    // }

    // loadAssistant()


    const loadAssistant = async() => {
        try {

            const res = await fetch(
                `https://voxifyaiserver.onrender.com/api/assistant/config/${userId}`
            )

            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status}`)
            }

            const data = await res.json()


            if (data) {
                assistantConfig = data.user
                applyConfig()
            }

        } catch (error) {
            console.log("Assistant Load Error:", error)
        }
    }

    const applyConfig = () => {

        if (!assistantConfig) return;

        popup.className =
            `voxify-popup theme-${assistantConfig.theme}`

        button.className =
            `voxify-btn theme-${assistantConfig.theme}`

        const title = popup.querySelector(".voxify-title")

        title.innerHTML =
            `Hello I'm ${assistantConfig.assistantName}`

        const subTitle = popup.querySelector(".voxify-sub")

        subTitle.innerHTML = `
        Welcome to ${assistantConfig.businessName}.
        <br/>
        Ask anything about your website.
    `;
    }
    loadAssistant()

    // element

    const status = popup.querySelector(".voxify-status");

    const wave = popup.querySelector(".voxify-wave");
    const userText = popup.querySelector(".voxify-user-text");
    const aiText = popup.querySelector(".voxify-ai-text");
    const mic = popup.querySelector(".voxify-mic");


    // text-speech

    const speak = (text) => {
        window.speechSynthesis.cancel();

        //show ai response
        aiText.innerText = text;
        status.innerText = "AI Speaking...";

        const speech = new SpeechSynthesisUtterance(text)

        speech.lang = "hi-IN";
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;
        // Voice end
        speech.onend = () => {
            status.innerText = "Tap button to Speak";

            wave.style.opacity = "0";
        };

        // start speaking 

        window.speechSynthesis.speak(
            speech
        );

    }


    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        mic.onclick = () => {
            wave.style.opacity = "1";

            status.innerText = "Listening...";

            userText.innerText = "";
            aiText.innerText = "";

            recognition.start();
        }

        recognition.onresult = (e) => {
            // console.log(e);

            const text = e.results[0][0].transcript

            userText.innerText = "You:" + text;
            recognition.stop();


            setTimeout(async() => {
                try {
                    status.innerText = "Thinking ...";


                    const res = await fetch("https://voxifyaiserver.onrender.com/api/assistant/ask", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",

                        },


                        body: JSON.stringify({
                            message: text,
                            userId
                        })
                    })

                    const data = await res.json()
                    console.log(data);


                    if (data.success) {
                        if (data.action === "navigate") {
                            speak(data.response)

                            setTimeout(() => {
                                window.location.href = data.path
                            }, 1500)
                        } else {
                            speak(data.aiResponse)
                        }
                        // } else {



                        //     speak("Response error, Please check your plan")

                        // }

                    } else {
                        const errMsg = data.message || "Response error, please check your plan";
                        speak(errMsg);
                        console.error("Assistant error:", data);
                    }
                } catch (error) {

                    console.log(error);
                    speak("AI Server Error")

                }
            }, 600)
        };


        recognition.onerror = () => {
            status.innerText = "Tap button to Speak";

            wave.style.opacity = "0";
        }
    } else {

        status.innerText = "Speech Recognition not supported";

    }

})();
