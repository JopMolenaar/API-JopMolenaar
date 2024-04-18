// Check if "rememberAccount" exists in localStorage
const accountId = localStorage.getItem("rememberAccount");
// If "rememberAccount" exists, redirect to the account page with the stored ID
if (accountId) {
    console.log("set href");
    window.location.href = `/account/${accountId}`; // Redirect to account/id
}
