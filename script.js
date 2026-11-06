
const cameras = document.getElementById("cameras");
const video = document.getElementById("video");
const iniciar = document.getElementById("iniciar");
const parar = document.getElementById("parar");
const mensagem = document.getElementById("mensagem");

let stream = null;

// Verificar se o navegador permite acessar a câmera
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mensagem.textContent = "Acesse pelo Live Server ou HTTPS para usar a câmera.";
}

// Listar dispositivos de vídeo
async function listarCameras() {

    const dispositivos = await navigator.mediaDevices.enumerateDevices();

    const lista = dispositivos.filter(
        dispositivo => dispositivo.kind === "videoinput"
    );

    const selecionada = cameras.value;

    cameras.innerHTML = "";

    lista.forEach((camera, index) => {

        const opcao = document.createElement("option");

        opcao.value = camera.deviceId;

        opcao.textContent = camera.label || "Câmera " + (index + 1);

        cameras.appendChild(opcao);

    });

    if (lista.some(camera => camera.deviceId === selecionada)) {
        cameras.value = selecionada;
    }

    if (lista.length === 0) {
        mensagem.textContent = "Nenhuma câmera encontrada.";
    }
}

// Ligar a câmera
async function iniciarCamera(deviceId = null) {

    try {

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Acesse a página pelo HTTPS ou Live Server.");
        }

        // Desligar câmera anterior, se existir
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        video.srcObject = null;

        mensagem.textContent = "Solicitando acesso à câmera...";

        // Solicitar acesso à câmera selecionada ou à câmera padrão
        const configuracao = deviceId
            ? {
                video: { deviceId: { exact: deviceId } },
                audio: false
            }
            : {
                video: true,
                audio: false
            };

        stream = await navigator.mediaDevices.getUserMedia(configuracao);

        // Mostrar imagem da webcam
        video.srcObject = stream;

        await video.play();

        // Atualizar lista com os nomes reais dos dispositivos
        await listarCameras();

        // Selecionar a câmera que está funcionando
        const cameraAtiva = stream.getVideoTracks()[0].getSettings().deviceId;

        if (cameraAtiva) {
            cameras.value = cameraAtiva;
        }

        mensagem.textContent = "Câmera ligada com sucesso!";

    } catch (erro) {

        console.error("Erro ao abrir câmera:", erro);

        if (erro.name === "NotAllowedError") {
            mensagem.textContent = "Permita o acesso à câmera no navegador.";
        } else if (erro.name === "NotFoundError") {
            mensagem.textContent = "Nenhuma webcam foi encontrada.";
        } else if (erro.name === "NotReadableError") {
            mensagem.textContent = "A câmera está sendo usada por outro programa.";
        } else {
            mensagem.textContent = erro.message || "Erro ao abrir a câmera.";
        }

    }
}

// Desligar câmera
function pararCamera() {

    if (stream) {

        stream.getTracks().forEach(track => track.stop());

        stream = null;

    }

    video.srcObject = null;

    mensagem.textContent = "Câmera desligada.";

}

// Trocar de dispositivo
cameras.addEventListener("change", function() {

    if (cameras.value) {
        iniciarCamera(cameras.value);
    }

});

// Eventos dos botões
iniciar.addEventListener("click", function() {
    iniciarCamera();
});

parar.addEventListener("click", pararCamera);

// Atualizar quando conectar ou remover uma webcam
navigator.mediaDevices?.addEventListener("devicechange", listarCameras);

// Carregar lista inicial
listarCameras().catch(console.error);
