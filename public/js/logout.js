//Logout
document.getElementById("logout").addEventListener("click", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    try {
        if(token) {
            await axios.post(
                "/admin/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }
    } catch(err) {
        console.log("Erro ao fazer logout:", err);
    } finally {
        localStorage.removeItem("authToken");
        window.location.href="../index.html";
    }
});
