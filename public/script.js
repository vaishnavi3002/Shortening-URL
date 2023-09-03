const btn = document.getElementById("copy-btn");
const text = document.getElementById("msg");
const done_btn = document.getElementById("done-btn");
const inputText = text.textContent;
btn.addEventListener("click", function(){
    navigator.clipboard.writeText(inputText);
    btn.classList.add("hidden");
    done_btn.classList.add("inline");
})