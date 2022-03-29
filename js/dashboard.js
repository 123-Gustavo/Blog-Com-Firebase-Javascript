// --------------------- Variaveis globais

var email = document.getElementById("emailLogin")
var senha = document.getElementById("senhaLogin")
var modalLogin = document.querySelector(".bg-login") 
var userPage = document.querySelector(".criarUsers")
var gerenciaUserPage = document.querySelector(".gerenciarUsers")
var postPage = document.querySelector(".criarPosts")
var gerenciarPostsPage = document.querySelector(".gerenciarPosts")
var categoryPage = document.querySelector(".criarCategory")
var gerenciarCategorysPage = document.querySelector(".gerenciarCategory")

// -------------------- Variaveis de utilização 

// variaveis da imagens
var imgSrc
var imgUrl

// variavel da modal usuario
var visivel = false

//--------------------- Chamando o firebase

const config = {
    /* Escreva as configs do seu firebase aqui */
};

firebase.initializeApp(config);


var db = firebase.firestore()
var storage = firebase.storage();

// --------------------- Funções de execução separadas

async function verificarPosts(autor) {


    // Puxar Os Dados Da Pasta De Postagens
    db.collection("Posts").get()
        .then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{

                
                // Validação Se O Post Foi Criado Por Aquele Usuario
                if(doc.data().author == autor){
                    let postsInfosUsersSelect = document.querySelector(".gerenciarUsers .users-infos .infos-users #postsUsers")

                    let options


                    // Adicionar os Posts Nas Options
                    for(var i = 0; i < querySnapshot.docs.length; i++){
                        options = ` <option value="${doc.data().titulo}" disabled>${doc.data().titulo}</option>`
                    }


                    // Adicionar As Options No Select
                    postsInfosUsersSelect.innerHTML += options
                        
                }
            })
        })
        .catch((error)=>{
            console.log(error.message)
        })
}

async function abrirModalUser(usuario,modalogar){
    let usermodal = document.querySelector(".userModal")
    let userIcon = document.querySelector(".dashboard-menu .menu-dashboard .items-menu-dashboard #userIcon")

    userIcon.addEventListener("click",(e)=>{
        if(visivel == false){
            visivel = true
            usermodal.style.display = "block"
            deslogar(usermodal,usuario,modalogar)
        }else if(visivel == true){
            visivel = false
            usermodal.style.display = "none"
        }
    })
}

async function deslogar(modalUsuario,user,modalLoginUser){
    let deslogarButton = document.querySelector(".userModal .userButtons .deslogar-btn")

    deslogarButton.addEventListener("click",(e)=>{
        firebase.auth().signOut().then((val)=>{            
            visivel = false
            modalUsuario.style.display = "none"
            modalLoginUser.style.display = "block"
            user = null
            abrirModalUser(user,modalUsuario)
        })
    })
    
}

// --------------------- Funções das paginas


// Pagina Para Criação do Usuario
async function criarUsuario(){
    if(userPage.style.display == "block"){
        setTimeout(() => {


            // Variaveis Para Criar o Usuario 
            let formUser = document.querySelector(".criarUsers .createUser form")
            let nameUser = document.getElementById("nomeUser")
            let emailUser = document.getElementById("emailUser")
            let senhaUser = document.getElementById("senhaUser")
            let priorityUserSelect = document.getElementById("priorityUser")
            let priorityValor = priorityUserSelect.value


            // Select Para Definição Da Prioridade Do Usuario
            priorityUserSelect.addEventListener("change",(e)=>{
                priorityValor = e.target.value
            })


            // Detectar o Envio Do Formulario
            formUser.addEventListener("submit",(e)=>{


                // Bloquear a atualização Da Pagina
                e.preventDefault()


                // Validar Campos Em Branco
                if(nameUser.value.length <= 0 || emailUser.value.length <= 0 || senhaUser.value.length <= 0){
                    return alert("[ERRO] Por favor, Preencha todos os campos")
                }else{


                    // Função Para Criação Do Usuario
                    firebase.auth().createUserWithEmailAndPassword(emailUser.value, senhaUser.value)
                        .then((userCredential) => {


                            // Variavel Que Guarda As Informações Do Usuario
                            var user = userCredential.user;


                            // Setar o nome do Usuario 
                            user.username = nameUser.value
                            user.updateProfile({
                                displayName: nameUser.value
                            })


                            // Validar Se a Prioridade For 1
                            if(priorityValor == 1){


                                // Colocar o Usuario Na WhiteList
                                db.collection("whitelist").add({
                                    email:emailUser.value
                                })
                                .then((docRef) => {})
                                .catch((error) => {
                                    alert(error.message)
                                });
                            }


                            // Colocar o Usuario Na Pasta de Usuarios
                            db.collection("users").add({
                                name:nameUser.value,
                                email:emailUser.value,
                                senha:senhaUser.value,
                                priority:priorityValor
                            })
                            .then((docRef) => {
                                alert("Usuario Criado com sucesso")
                            })
                            .catch((error) => {
                                alert(error.message)
                            });
                        })
                        .catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            alert(errorMessage)
                        });
                }

                
            })
            
        }, 500);
    }
}


// Pagina Para Gerenciamento dos Usuarios
async function gerenciarUsuario(){
    if(gerenciaUserPage.style.display == "block"){
        setTimeout(() => {


            // Coletar Os Documentos Da Pasta Users
            db.collection("users").get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let mainGerenciarUsers = document.querySelector(".gerenciarUsers .users .usuarios")                  

                            // Adicionar Os Usuarios no Corpo
                            mainGerenciarUsers.innerHTML += `
                                <div class="users-single" nome="${doc.data().name}" email="${doc.data().email}" priority="${doc.data().priority}" senha="${doc.data().senha}">
                                    <h4><a href="#">${doc.data().name}</a></h4>
                                </div>
                            `

                            let infosUsers = mainGerenciarUsers.querySelectorAll(".users-single")


                            // Gerar As Informações Do Usuario
                            for(var i = 0; i < infosUsers.length;i++){


                                // Identificar o Clique Do Usuario Na Box
                                infosUsers[i].addEventListener("click",(e)=>{
                                    let usersBox = e.target.parentNode.parentNode.parentNode.parentNode

                                    console.log(usersBox)

                                    let infosUsers = document.querySelector(".gerenciarUsers .users-infos")
        

                                    // Setar Dados Nos Input
                                    let tituloNomeUsers = document.querySelector(".gerenciarUsers .users-infos h2")

                                    tituloNomeUsers.innerText = `${e.target.parentNode.parentNode.getAttribute("nome")}`

                                    let nomeUsers = document.querySelector(".gerenciarUsers .users-infos .infos-users #nomeUsers")

                                    nomeUsers.value  = `${e.target.parentNode.parentNode.getAttribute("nome")}`

                                    let emailUsers = document.querySelector(".gerenciarUsers .users-infos .infos-users #emailUsers")

                                    emailUsers.value = `${e.target.parentNode.parentNode.getAttribute("email")}`

                                    let senhaUsers = document.querySelector(".gerenciarUsers .users-infos .infos-users #senhaUsers")

                                    senhaUsers.value = `${e.target.parentNode.parentNode.getAttribute("senha")}`

                                    let priorityUsers = document.querySelector(".gerenciarUsers .users-infos .infos-users #priorityUsers")

                                    priorityUsers.value = `${e.target.parentNode.parentNode.getAttribute("priority")}`
                                    

                                    // Ativar e desativar as boxes
                                    infosUsers.style.display = "block"
                                    usersBox.style.display = "none"


                                    // Verificar Os Posts Do Usuario
                                    verificarPosts(e.target.parentNode.parentNode.getAttribute("nome"))
                                })
                            }

                        });
                    })
                    .catch((err)=>{
                        console.log(err.message)
                    })
        }, 500);
    }
}


// Pagina Para Criação de Postagens 
async function criarPosts(authorName){
    if(postPage.style.display == "block"){
        setTimeout(() => {
            let formPost = document.querySelector(".criarPosts .createPost form")
            let tituloPost = document.getElementById("tituloPost")
            let descPost = document.getElementById("descPost")
            let thumbPost = document.getElementById("thumbPost")
            let categoryPostSelect = document.getElementById("categoryPost")
            let categoryValor = categoryPostSelect.value

            // Gerar as categorias no select

            db.collection("Category").get()
                .then((querySnapshot)=>{
                    querySnapshot.forEach((doc)=>{
                        let opcoes

                        for(var i = 0; i < querySnapshot.docs.length; i++){
                            opcoes = `<option value="${doc.data().name}">${doc.data().name}</option>`
                        }

                        categoryPostSelect.innerHTML += opcoes
                    })
                })
                .catch((err)=>{
                    console.log(err.message)
                })

            // Sistema para criar o nome

            const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result= '';
            const charactersLength = characters.length;
            for ( let i = 0; i < 10; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        
            const characters2 ='BADCEFGHIJKLMNOPRQSTUVWXZYabcdegfhikjlmnoprpstvuwxyz0123456789';
            let result2= '';
            const charactersLength2 = characters2.length;
            for ( let i = 0; i < 15; i++ ) {
                result2 += characters2.charAt(Math.floor(Math.random() * charactersLength2));
            }
        
            // Setar a categoria escolhida

            categoryPostSelect.addEventListener("change",(e)=>{
                categoryValor = e.target.value
                console.log(categoryValor)
            })

            // Sistema pra fazer o upload
            const nomeImagem = `${result + result2}`
           
            function salvarImagemFirebase(){


                // Enviar A Imagem Para O Storage
                thumbPost.addEventListener("change",(e)=>{
                    const imagemArquivo = e.target.files[0]
                    
                    const upload = storage.ref(`ThumbPosts/${nomeImagem}`).put(imagemArquivo)
                    .then((savedImg) =>{
                        
                    })
                    .catch((error)=>{
                        alert(error.message)
                    })
                    
                })
                setTimeout(() => {


                    // Detectar O Envio Do Formulario
                    formPost.addEventListener("submit",(e)=>{


                        // Cancelar A Atualização Da Pagina
                        e.preventDefault()
                            

                        // Validar Se Os Campos Estão vazios
                        if(tituloPost.value.length <= 0){
                            return alert("[ERRO] Por favor, Preencha todos os campos")
                        }else{


                            // Puxar Os Dados Da Imagem Do Storage
                            storage.ref(`ThumbPosts/${nomeImagem}`).getDownloadURL().then((url)=>{


                                // Adicionar O Documento Do Post Na Pasta Posts
                                db.collection("Posts").add({
                                    titulo:tituloPost.value,
                                    desc:descPost.value,
                                    thumb:url,
                                    author:authorName,
                                    categoria:categoryValor,
                                    data:firebase.firestore.FieldValue.serverTimestamp()
                                })
                                .then((docRef) => {
                                    alert("Post feito com sucesso")
                                })
                                .catch((error) => {
                                    alert(error.message)
                                });
                            })
                                
                        }
                    })
                }, 750);
                
            }            
            
            salvarImagemFirebase()
            
        }, 500);
    }
}


// Pagina Para Gerenciamento de Postagens
async function gerenciarPosts(){
    if(gerenciarPostsPage.style.display == "block"){
        setTimeout(() => {


            // Coletar Os Documentos Da Pasta Posts
            db.collection("Posts").get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let mainGerenciarPosts = document.querySelector(".gerenciarPosts .posts .postagens")


                            // Adicionar As Boxes Dos Documentos Na Pagina
                            mainGerenciarPosts.innerHTML += `
                            <div class="posts-single" titulo="${doc.data().titulo}" thumb="${doc.data().thumb}" desc="${doc.data().desc}" author="${doc.data().author}" category="uncategorized">
                                    <img src="${doc.data().thumb}">
                                    <h4><a href="#">${doc.data().titulo}</a></h4>    
                            </div>
                            `

                            const infosPosts = mainGerenciarPosts.querySelectorAll(".posts-single")


                            // Setar As Informações Na Area de Informações Do Posts
                            for(var i = 0; i < infosPosts.length;i++){


                                // Identificar o Clique Do Usuario Na Box
                                infosPosts[i].addEventListener("click",(e)=>{
                                    let postsBox = e.target.parentNode.parentNode.parentNode.parentNode


                                    // Setar As Informações Nos Inputs
                                    let tituloNomePost = document.querySelector(".gerenciarPosts .posts-infos h2")

                                    tituloNomePost.innerText = `${e.target.parentNode.getAttribute("titulo")}`

                                    let tituloPost = document.querySelector(".gerenciarPosts .posts-infos .infos-post #tituloPostInfos")

                                    tituloPost.value  = `${e.target.parentNode.getAttribute("titulo")}`

                                    let descPost = document.querySelector(".gerenciarPosts .posts-infos .infos-post #descPostInfos")

                                    descPost.value = `${e.target.parentNode.getAttribute("desc")}`

                                    let thumbPost = document.querySelector(".gerenciarPosts .posts-infos .infos-post #thumbPostInfos")

                                    thumbPost.value = `${e.target.parentNode.getAttribute("thumb")}`

                                    let categoryPost = document.querySelector(".gerenciarPosts .posts-infos .infos-post #categoryPostInfos")

                                    categoryPost.value = `${e.target.parentNode.getAttribute("category")}`

                                    let authorPost = document.querySelector(".gerenciarPosts .posts-infos .infos-post #authorPostInfos")

                                    authorPost.value = `${e.target.parentNode.getAttribute("author")}`


                                    // Ativar E Desativar A Pagina
                                    document.querySelector(".gerenciarPosts .posts-infos").style.display = "block"
                                    document.querySelector(".gerenciarPosts .posts").style.display = "none"
                                })
                            }

                        });
                    })
                    .catch((err)=>{
                        console.log(err.message)
                    })
        }, 500);
    }
}


// Pagina Para Criação de Categorias
async function criarCategory(){
    if(categoryPage.style.display == "block"){
        setTimeout(() => {
            

            // Definir Variaveis Da Pagina
            let formCategory = document.querySelector(".main-dashboard .criarCategory .createCategory form")
            let nomeCategory = document.querySelector(".main-dashboard .criarCategory .createCategory form input#nameCategory")
            let postsLimitCategory = document.querySelector(".main-dashboard .criarCategory .createCategory form input#limitPostsCategory")


            // Detectar Envio Do Formulario
            formCategory.addEventListener("submit",(e)=>{
 
 
                // Bloquear A Atualização Da Pagina
                e.preventDefault()


                // Validação Dos Campos Do Formulario
                if(nomeCategory.value.length <= 0 || postsLimitCategory.value.length <= 0){
                    alert("[ERRO] Por favor, Preencha todos os campos")
                }else{

                    
                    // Adicionar O Documento Na Pasta Categoria
                    db.collection("Category").add({
                        name:nomeCategory.value,
                        limitPosts:postsLimitCategory.value,
                        data:firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then((docRef) => {
                        alert("Categoria feita com sucesso")
                    })
                    .catch((error) => {
                        alert(error.message)
                    });
                }
            })

        }, 500);
    }
}


// Pagina Para Gerenciamento de Categorias
async function gerenciarCategorys(){
    if(gerenciarCategorysPage.style.display == "block"){
        setTimeout(() => {


            // Coletar Dados Da Pasta Categoria
            db.collection("Category").get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let mainGerenciarCategorys = document.querySelector(".categorias")

                            mainGerenciarCategorys.style.display = "flex"


                            // Adicionar Box da Categoria Na Pagina
                            mainGerenciarCategorys.innerHTML += `
                            <div class="category-single" nome="${doc.data().name}" postslimit="${doc.data().limitPosts}" data="${doc.data().data}">
                                <h4><a href="#">${doc.data().name}</a></h4>
                            </div>
                            `

                    
                            const infosCategorys = mainGerenciarCategorys.querySelectorAll(".category-single")


                            // Coletar Dados E Colocar Nos Inputs
                            for(var i = 0; i < infosCategorys.length;i++){


                                // Identificar O Clique Na Box
                                infosCategorys[i].addEventListener("click",(e)=>{
                                    let categoryBox = e.target.parentNode.parentNode.parentNode.parentNode


                                    // Colocar As Informações Nos Inputs
                                    let tituloNomeCategory = document.querySelector(".gerenciarCategory .category-infos h2")

                                    tituloNomeCategory.innerText = `${e.target.getAttribute("nome")}`
                                    
                                    let nomeCategory = document.querySelector(".gerenciarCategory .category-infos .infos-category #nomeCategory")

                                    nomeCategory.value  = `${e.target.getAttribute("nome")}`

                                    let postsLimitCategory = document.querySelector(".gerenciarCategory .category-infos .infos-category #postslimitCategory")

                                    postsLimitCategory.value = `${e.target.getAttribute("postslimit")}`

                                    let dataCategory = document.querySelector(".gerenciarCategory .category-infos .infos-category #dateCategory")

                                    dataCategory.value = `${e.target.getAttribute("data")}`
                                    

                                    // Desativar e Ativar A Pagina
                                    document.querySelector(".gerenciarCategory .category-infos").style.display = "block"
                                    document.querySelector(".gerenciarCategory .categorys").style.display = "none"
                                })
                            }

                        });
                    })
                    .catch((err)=>{
                        console.log(err.message)
                    })
        }, 500);
    }
}

// --------------------- Menu Sidebar

function menuSidebar(usuario){

    let itemsMenuSide = document.querySelectorAll(".menu-sidebar .items-menu-sidebar li a")


    for(var c = 0; c < itemsMenuSide.length; c++){
        itemsMenuSide[c].addEventListener("click",(e)=>{

            let valor = e.target.parentNode.getAttribute("valor")

            switch(valor){
                case "gerenCategory":
                    gerenciarCategorysPage.style.display = "block"
                    categoryPage.style.display = "none"
                    gerenciarPostsPage.style.display = "none"
                    postPage.style.display = "none"
                    gerenciaUserPage.style.display = "none"
                    userPage.style.display = "none"
                    document.querySelector(".gerenciarCategory .category-infos").style.display = "none"
                    document.querySelector(".gerenciarCategory .categorys").style.display = "block"
                    document.querySelector(".gerenciarCategory .categorys .categorias").innerHTML = ""
                    gerenciarCategorys()
                    break
                case "criarCategory":
                    gerenciarCategorysPage.style.display = "none"
                    categoryPage.style.display = "block"
                    gerenciarPostsPage.style.display = "none"
                    postPage.style.display = "none"
                    gerenciaUserPage.style.display = "none"
                    userPage.style.display = "none"
                    criarCategory()
                    break
                case "gerenPosts":
                    gerenciarCategorysPage.style.display = "none"
                    categoryPage.style.display = "none"
                    gerenciarPostsPage.style.display = "block"
                    postPage.style.display = "none"
                    gerenciaUserPage.style.display = "none"
                    userPage.style.display = "none"
                    document.querySelector(".gerenciarPosts .posts-infos").style.display = "none"
                    document.querySelector(".gerenciarPosts .posts").style.display = "block"
                    document.querySelector(".gerenciarPosts .posts .postagens").innerHTML = ""
                    gerenciarPosts()
                    break
                case "criarPosts":
                    gerenciarCategorysPage.style.display = "none"
                    categoryPage.style.display = "none"
                    gerenciarPostsPage.style.display = "none"
                    postPage.style.display = "block"
                    gerenciaUserPage.style.display = "none"
                    userPage.style.display = "none"
                    criarPosts(usuario.displayName)
                    break
                case "gerenUsuarios":
                    gerenciarCategorysPage.style.display = "none"
                    categoryPage.style.display = "none"
                    gerenciarPostsPage.style.display = "none"
                    postPage.style.display = "none"
                    gerenciaUserPage.style.display = "block"
                    userPage.style.display = "none"
                    document.querySelector(".gerenciarUsers .users-infos").style.display = "none"
                    document.querySelector(".gerenciarUsers .users").style.display = "block"
                    document.querySelector(".gerenciarUsers .users .usuarios").innerHTML = ""
                    gerenciarUsuario();
                    break
                case "criarUsuarios":
                    gerenciarCategorysPage.style.display = "none"
                    categoryPage.style.display = "none"
                    gerenciarPostsPage.style.display = "none"
                    postPage.style.display = "none"
                    gerenciaUserPage.style.display = "none"
                    userPage.style.display = "block"
                    criarUsuario()
                    break
                default:
                    alert("[ERRO] Algum Erro Na Navegação Aconteceu, Por favor Espere Ser Resolvido")
                    break
            }
        })
    }
}

// --------------------- Sistema de Login

document.querySelector(".bg-login .login-dashboard .login form").addEventListener("submit",(e)=>{
    e.preventDefault()

    if(email.value.length <= 0 || senha.value.length <= 0){
        alert("[ERRO] Por favor, Preencha todos os campos")
        return
    }else{
        firebase.auth().signInWithEmailAndPassword(email.value, senha.value)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                db.collection("whitelist").get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            if(!(doc.data().email == email.value)){
                                alert("Você não tem acesso ao dashboard");
                                return
                            }else{
                                modalLogin.style.display = "none"
                                abrirModalUser(user,modalLogin)
                                menuSidebar(user)
                            }
                        });
                    })
                    .catch((err)=>{
                        console.log(err.message)
                    })
                
                
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                alert(errorMessage)
            });
    }

    
})

