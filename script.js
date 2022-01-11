let addBtn = document.querySelector(".add-btn");
let txtArea = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priorityColor");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let removeBtn = document.querySelector(".remove-btn");
let allToolboxColors = document.querySelectorAll(".color");

let modalPriorityColor = "black";

let colors = ["lightsalmon", "lightcoral", "lightgreen", "black"];

let addFlag = false;
let removeFlag = false;
let ticketsArr = []; //Array of objects

//READ DB
if (localStorage.getItem("jira_ticket")) {
  ticketsArr = JSON.parse(localStorage.getItem("jira_ticket"));
  ticketsArr.forEach((ticketObj) => {
    createTicket(ticketObj.ticketColor, ticketObj.task, ticketObj.ticketID);
  });
}

addBtn.addEventListener("click", (e) => {
  // toggle modal
  addFlag = !addFlag;
  if (addFlag) {
    modalCont.style.display = "flex";
  } else {
    modalCont.style.display = "none";
  }
});

removeBtn.addEventListener("click", (e) => {
  removeFlag = !removeFlag; //->toggle
});

//Listener for modal priority color
allPriorityColors.forEach((colorElem) => {
  colorElem.addEventListener("click", (e) => {
    //Remove border from every color
    allPriorityColors.forEach((priorityColorElem) => {
      priorityColorElem.classList.remove("border");
    });
    //Add border to clicked color
    colorElem.classList.add("border");
    modalPriorityColor = colorElem.classList[0];
  });
});

modalCont.addEventListener("keydown", (e) => {
  if (e.key === "Shift") {
    createTicket(modalPriorityColor, txtArea.value);
    addFlag = false;
    setModalToDefault();
  }
});

function createTicket(ticketColor, task, ticketID) {
  //New Ticket -> undefined
  let id = ticketID || shortid();

  //creating object of each tickets
  if (ticketID === undefined) {
    let obj = {
      ticketColor: ticketColor,
      task: task,
      ticketID: id
    };

    ticketsArr.push(obj);
    //CREATE and Store in DB
    localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));
  }

  let ticketElem = document.createElement("div");
  ticketElem.setAttribute("class", "ticket-cont");
  ticketElem.innerHTML = ` <div class="ticket-cont">
  <div class="ticket-color ${ticketColor}"></div>
  <div class="ticket-id">#${id}</div>
  <div class="task-cont">${task}</div>
  <div class="ticket-lock"><i class="fa fa-lock" aria-hidden="true"></i></div>
  </div>`;
  mainCont.append(ticketElem);
  handelRemoval(ticketElem, id);
  handelLock(ticketElem, id);
  handelColor(ticketElem, id);
}

function handelRemoval(ticket, id) {
  //If removeFlaf -> true => Remove Ticket
  ticket.addEventListener("click", (e) => {
    if (removeFlag === false) return;

    //DB removal
    let ticketIdx = getTicketIdx(id);
    ticketsArr.splice(ticketIdx, 1);
    localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));

    //UI removal
    ticket.remove();
  });
}

function handelLock(ticket, id) {
  let iconElem = ticket.querySelector(".ticket-lock").children[0];
  let taskArea = ticket.querySelector(".task-cont");
  iconElem.addEventListener("click", (e) => {
    if (iconElem.classList.contains("fa-lock")) {
      iconElem.classList.remove("fa-lock");
      iconElem.classList.add("fa-lock-open");
      taskArea.setAttribute("contenteditable", true);
    } else {
      iconElem.classList.remove("fa-lock-open");
      iconElem.classList.add("fa-lock");
      taskArea.setAttribute("contenteditable", false);
    }

    //Modify ticketsArr's task
    let ticketIdx = getTicketIdx(id);
    ticketsArr[ticketIdx].task = taskArea.innerText;
    localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));
  });
}

function handelColor(ticket, id) {
  let ticketColorElem = ticket.querySelector(".ticket-color");
  ticketColorElem.addEventListener("click", (e) => {
    let currTicketColor = ticketColorElem.classList[1];
    let currentColorIdx = colors.indexOf(currTicketColor);
    let newColorIdx = (currentColorIdx + 1) % colors.length;
    let newColor = colors[newColorIdx];
    ticketColorElem.classList.remove(currTicketColor);
    ticketColorElem.classList.add(newColor);

    //Modify ticketsArr's ticket color
    let ticketIdx = getTicketIdx(id);
    ticketsArr[ticketIdx].ticketColor = newColor;
    localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));
  });
}

function getTicketIdx(id) {
  let idx = ticketsArr.findIndex((ticketObj) => {
    return ticketObj.ticketID === id;
  });
  return idx;
}

//Sort tickets by colors
for (let i = 0; i < allToolboxColors.length; i++) {
  allToolboxColors[i].addEventListener("click", (e) => {
    let selColor = allToolboxColors[i].classList[0];
    let filteredTickets = ticketsArr.filter((ticketObj) => {
      return selColor === ticketObj.ticketColor;
    });

    //Remove previous container
    let allTicketCont = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketCont.length; i++) {
      allTicketCont[i].remove();
    }

    //Display new filtered tickets
    filteredTickets.forEach((ticketObj) => {
      createTicket(ticketObj.ticketColor, ticketObj.task, ticketObj.ticketID);
    });
  });

  allToolboxColors[i].addEventListener("dblclick", (e) => {
    //Remove previous containers
    let allTicketCont = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketCont.length; i++) {
      allTicketCont[i].remove();
    }

    //Display new filtered tickets
    ticketsArr.forEach((ticketObj) => {
      createTicket(ticketObj.ticketColor, ticketObj.task, ticketObj.ticketID);
    });
  });
}

function setModalToDefault() {
  modalCont.style.display = "none";
  txtArea.value = "";

  //Remove border from every color
  allPriorityColors.forEach((priorityColorElem) => {
    priorityColorElem.classList.remove("border");
  });

  //Add border to default color
  allPriorityColors[allPriorityColors.length - 1].classList.add("border");
  modalPriorityColor = "black";
}
