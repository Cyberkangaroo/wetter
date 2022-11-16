var stationen = new Object();



function setName(){
    stationen = {}
    let get = new XMLHttpRequest();
    get.onreadystatechange = () => {
        if(get.readyState === 4 && get.status === 200){ //Statusprüfung
            stationen = JSON.parse(get.response);
            console.log(stationen)

            
            let buttons_html = "";
            stationen.forEach(function(obj) { buttons_html += "<form action=\"/station/"+obj.ID+"\" class=\"station_select\"><input type=\"submit\" value=\""+obj.ORT+"\" class=\"station_button\" /></form>"; });
            document.getElementById("buttons").innerHTML = buttons_html;
            
            
        }
    };
    get.open("GET", "http://192.168.178.51:3000/api/name", true); //True für Asynchron
    get.send(stationen);
}

