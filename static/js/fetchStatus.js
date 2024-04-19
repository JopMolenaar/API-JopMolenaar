const contactId = document.querySelector("input[name=contactId]").value;
const pForStatus = document.getElementById("statusOfContact");

if (contactId) {
    getContactStatus();
    setInterval(getContactStatus, 4000);
}

async function getContactStatus() {
    await fetch(`/getStatusContact/${contactId}`).then(async (response) => {
        if (response.ok) {
            const data = await response.json();
            pForStatus.textContent = data.status;
        } else {
            console.error("Failed to get status");
        }
    });
}
