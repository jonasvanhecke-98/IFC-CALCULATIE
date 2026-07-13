const statusElement = document.getElementById("status");
const connectButton = document.getElementById("connect-button");
const resultElement = document.getElementById("result");

let workspaceApi = null;

connectButton.addEventListener("click", connectToTrimble);

async function connectToTrimble() {
  connectButton.disabled = true;
  setStatus("Bezig met verbinden...");

  try {
    const TrimbleApi =
      window.TrimbleConnectWorkspace ||
      window.TrimbleConnectWorkspaceApi;

    if (!TrimbleApi) {
      throw new Error(
        "De Trimble Connect Workspace API kon niet worden geladen."
      );
    }

    workspaceApi = await TrimbleApi.connect(
      window.parent,
      handleTrimbleEvent,
      30000
    );

    setStatus(
      "Verbinding met Trimble Connect geslaagd.",
      "success"
    );

    showResult({
      connected: true,
      message: "Workspace API is beschikbaar."
    });
  } catch (error) {
    console.error(error);

    setStatus(
      "Geen verbinding. Open deze pagina als extensie in Trimble Connect.",
      "error"
    );

    showResult({
      connected: false,
      error:
        error instanceof Error
          ? error.message
          : String(error)
    });
  } finally {
    connectButton.disabled = false;
  }
}

function handleTrimbleEvent(event, data) {
  console.log("Trimble Connect event:", event, data);
}

function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = "status";

  if (type) {
    statusElement.classList.add(type);
  }
}

function showResult(data) {
  resultElement.hidden = false;
  resultElement.textContent = JSON.stringify(data, null, 2);
}
