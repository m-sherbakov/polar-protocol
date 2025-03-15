const stakeTab = document.getElementById("stake-tab");
const sendTab = document.getElementById("send-tab");

const stakeCard = document.getElementById("stake-card");
const sendCard = document.getElementById("send-card");

const connectWalletButton = document.querySelector(".connect-wallet");

let buttonStake = document.querySelector('.go-button-stake');
let buttonSend = document.querySelector('.go-button');

buttonStake.addEventListener('click', getValueStake);
buttonSend.addEventListener('click', getValueSend);

function getValueStake() {
  let valueStake = document.querySelector(".input-stake-value").value;
  console.log("Stake Amount:", valueStake);
}

function getValueSend() {
  let valueSend = sendCard.querySelector('input[type="number"]').value;
  let addressSend = sendCard.querySelector('input[type="text"]').value;
  
  console.log("Send Amount:", valueSend);
  console.log("Send Address:", addressSend);
}

stakeTab.addEventListener("click", function() { 
  stakeCard.style.display = "block";
  sendCard.style.display = "none";

  stakeTab.classList.add("active");
  sendTab.classList.remove("active");
});

sendTab.addEventListener("click", function() { 
  stakeCard.style.display = "none";
  sendCard.style.display = "block";

  sendTab.classList.add("active");
  stakeTab.classList.remove("active");
});

connectWalletButton.addEventListener("click", async function() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Подключенные аккаунты:", accounts);
      connectWalletButton.textContent = "Connected";
    } catch (error) {
      console.error("Ошибка при подключении:", error);
    }
  } else {
    alert("MetaMask не обнаружен. Пожалуйста, установите MetaMask.");
  }
});
