var product = JSON.parse(localStorage.product);
var content = document.getElementById('proudctConant');
let totalPrice = 0;
let totalItems = 0;
function displayProducts() {
    content.innerHTML = '';
    totalPrice = 0;
    totalItems = product.length;

    for (let i = 0; i < product.length; i++) {
        content.innerHTML += `
        <div class="row border-top border-bottom">
            <div class="row main align-items-center">
                <div class="col-2"><img class="img-fluid" src="${product[i].image}"></div>
                <div class="col">
                    <div class="row text-muted">${product[i].title}</div>
                    <div class="row">STORY</div>
                </div>
                
                <div class="col">&euro; ${product[i].price} </div>
                <div class="close btn" onclick='clearData(${i})'>Clear</div>
            </div>
        </div>
        `;
        totalPrice += Number(product[i].price);
    }
    document.getElementById('priceItems').innerHTML=`$ ${totalPrice.toString()}`;
    document.getElementById('contentI').innerHTML =`${totalItems} ITEMS`;
    document.getElementById('contItem').innerHTML =`${totalItems} items`;
    var total=totalPrice+5;
    document.getElementById('total').innerHTML = `$ ${total.toString()}`;
    localStorage.setItem('productPrice',`${total.toString()}`);
}
function clearData(i) {
    totalPrice -= product[i].price;
    product.splice(i, 1);
    localStorage.product = JSON.stringify(product);
    totalItems = product.length;
    displayProducts();

}
displayProducts();

