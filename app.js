const statusElement = document.getElementById("status");
const connectButton = document.getElementById("connect-button");
const resultElement = document.getElementById("result");

const projectCard = document.getElementById("project-card");
const projectName = document.getElementById("project-name");
const projectId = document.getElementById("project-id");
const projectRegion = document.getElementById("project-region");

let workspaceApi = null;
let isConnecting = false;

connectButton.addEventListener("click", connectToTrimble);

window.addEventListener("load", () => {
  if (window.parent !== window) {
    connectToTrimble();
  } else {
    setStatus(
      "De website werkt. Open deze pagina als extensie binnen Trimble Connect.",
      "warning"
    );
  }
});

async function connectToTrimble() {
  if (isConnecting) {
    return;
  }

  isConnecting = true;
  connectButton.disabled = true;

  setStatus("Bezig met verbinden met Trimble Connect...");

  try {
    if (!window.TrimbleConnectWorkspace) {
      throw new Error(
        "De Trimble Connect Workspace API werd niet geladen."
      );
    }

    workspaceApi =
      await window.TrimbleConnectWorkspace.connect(
        window.parent,
        handleTrimbleEvent,
        30000
      );

    setStatus(
      "Verbinding met Trimble Connect geslaagd.",
      "success"
    );

    await loadProjectInformation();
  } catch (error) {
    console.error("Verbindingsfout:", error);

    setStatus(
      "Geen verbinding. Open de tool als extensie in de Trimble Connect 3D Viewer.",
      "error"
    );

    showDebug({
      connected: false,
      error: getErrorMessage(error),
      location: window.location.href,
      insideIframe: window.parent !== window
    });
  } finally {
    connectButton.disabled = false;
    isConnecting = false;
  }
}

async function loadProjectInformation() {
  if (!workspaceApi) {
    throw new Error("Workspace API is nog niet verbonden.");
  }

  try {
    const project = await workspaceApi.project.getProject();

    projectCard.hidden = false;

    projectName.textContent =
      project?.name ||
      project?.title ||
      "Naam niet beschikbaar";

    projectId.textContent =
      project?.id ||
      project?.projectId ||
      "ID niet beschikbaar";

    projectRegion.textContent =
      project?.region ||
      project?.location ||
      "Regio niet beschikbaar";

    showDebug({
      connected: true,
      project
    });
  } catch (error) {
    console.error("Projectgegevens konden niet worden geladen:", error);

    setStatus(
      "Verbonden, maar de projectgegevens konden niet worden opgehaald.",
      "warning"
    );

    showDebug({
      connected: true,
      projectLoaded: false,
      error: getErrorMessage(error)
    });
  }
}

function handleTrimbleEvent(event, data) {
  console.log("Trimble Connect event:", event, data);

  if (event === "extension.sessionInvalid") {
    setStatus(
      "De Trimble Connect-sessie is niet meer geldig.",
      "error"
    );
  }
}

function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = "status";

  if (type) {
    statusElement.classList.add(type);
  }
}

function showDebug(data) {
  resultElement.textContent = JSON.stringify(data, null, 2);
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
