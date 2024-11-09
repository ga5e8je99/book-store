var card=document.querySelectorAll('.cardcontent .card');
const wrapper=document.getElementById('details');
        const shadow =document.getElementsByClassName('shadow');
        var wrapperImage=document.getElementById('cardImage');
        var wrapperTitle = document.getElementById('cardTitle');
        var wrapperDescription=document.getElementById('cardDescription');
        var wrapperPrice=document.getElementById('price');
        var cart;
        //////////////////////
card.forEach(el =>{
    el.addEventListener('click',function(){

        if(shadow[0].classList.contains('active') && wrapper.classList.contains('active')){
            shadow[0].classList.remove('active');
            wrapper.classList.remove('active');
        }else{
            
            shadow[0].classList.add('active');
            wrapper.classList.add('active');
        }
    })
});
/////////
function showImage(src,titleBook,disirptionCard,priceBook) {
    wrapperImage.src = src;
    wrapperTitle.textContent=titleBook;
    wrapperDescription.textContent=disirptionCard;
    wrapperPrice.textContent=priceBook;
    
    
}

if(localStorage.product!=null){
    cart=JSON.parse(localStorage.product);
}else{
    cart=[];
}
document.getElementById("addCard").onclick=function(){
    var details={
        image:wrapperImage.src,
        title:wrapperTitle.textContent,
        price:wrapperPrice.textContent,
        type:'Story'
    };
    cart.push(details)
    localStorage.setItem('product', JSON.stringify(cart));
    window.open('html/shop.html');
}
///////////////////////
document.getElementsByClassName('fa-x')[0].addEventListener('click',function () {
    if(shadow[0].classList.contains('active') && wrapper.classList.contains('active')){
        shadow[0].classList.remove('active');
        wrapper.classList.remove('active');
    }else{
        
        shadow[0].classList.add('active');
        wrapper.classList.add('active');
    }
})
///////////////////
var log=document.getElementsByClassName('logo');
log[0].addEventListener('click',function () {
    document.getElementsByClassName('sidebar')[0].style.width='fit-content';
    document.getElementsByClassName('fa-circle-xmark')[0].style.display='block';
});
document.getElementsByClassName('fa-circle-xmark')[0].addEventListener('click',function () {
    document.getElementsByClassName('sidebar')[0].style.width='50px';
    document.getElementsByClassName('fa-circle-xmark')[0].style.display='none';
});



const inputBox = document.getElementById("inputBox");
const suggestionsBox = document.getElementById("suggestions");
const suggestionItems = Array.from(suggestionsBox.querySelectorAll("li"));


inputBox.addEventListener("input", () => {
    const query = inputBox.value.toLowerCase().trim();

    if (query === "") {
        suggestionsBox.style.display = "none"; 
        return;
    }

    let hasMatch = false;

    suggestionItems.forEach((item) => {
        const title = item.querySelector("span").textContent.toLowerCase();
        
        if (title.includes(query)) {
            item.style.display = "flex";
            hasMatch = true;
        } else {
            item.style.display = "none"; 
        }
    });

    suggestionsBox.style.display = hasMatch ? "block" : "none";
});


document.addEventListener("click", (event) => {
    if (!inputBox.contains(event.target) && !suggestionsBox.contains(event.target)) {
        suggestionsBox.style.display = "none";
    }
});

