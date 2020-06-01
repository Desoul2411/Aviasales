const formSearch = document.querySelector('.form-search'),
inputCitiesFrom = document.querySelector('.input__cities-from'),
dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
inputCitiesTo = document.querySelector('.input__cities-to'),
dropDownCitiesTo = document.querySelector('.dropdown__cities-to'),
inputDateDepart = document.querySelector('.input__date-depart'),
cheapestTicket = document.getElementById('cheapest-ticket'),
otherCheapTickets = document.getElementById('other-cheap-tickets');




//Данные
const citiesAPI = 'http://api.travelpayouts.com/data/ru/cities.json';   // обращаться онлайн напрямую
//const citiesAPI = 'db/cities.json';  // скачали json т обращаемся уже к файлу оффлайн
const proxy = 'https://cors-anywhere.herokuapp.com/';  // заменяет использование сервера
const API_KEY = '8a9ef401a08a81ef02d0abbd42063ee1';   //ключ к API  доступа к данным по авиабилетам (travelpayouts )
const calendar = 'http://min-prices.aviasales.ru/calendar_preload';  // url для запроса на календарь цен

const MAX_CARD_COUNT = 10; // кол-во карточек для вывода
/*const city = ["Москва","Санкт-Петербург","Минск","Караганда","Челябинск",
"Керч","Волгоград","Самара","Днепропетровск","Екатеринбург","Одесса",
"Ухань","Шымкен","Нижний Новгород","Калининград","Вроцлав","Ростов-на-Дону"];*/

let city = [];


const getData = (url, callback, reject = console.error) => {  // console.error - ф-ция по умолчанию, если ничего не передаём 
    const request = new XMLHttpRequest();
    request.open('GET',url);

    request.addEventListener('readystatechange',() => {
        if(request.readyState !== 4) return;
        if(request.status === 200) {
            callback(request.response);
        } else {
            reject(request.status);
        }
    });
        request.send(); 
};






const showCity =  (input, list) => {
    list.textContent = '';

    if(input.value === '') return;  // убрать список если поле пустое

    const filterCity = city.filter(item => {
        const fixItem = item.name.toLowerCase();
        return  fixItem.startsWith(input.value.toLowerCase());  // метод startsWith - вбудет искать в fixItem  по первой введённой букве!
    });


   
    //console.log(filterCity)

    filterCity.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('dropdown_city');
        li.textContent = item.name;
        list.append(li);
    });
};



const selectCity = (event, input,list) =>{
    const target = event.target;
    if(target.tagName.toLowerCase() === 'li') {
        input.value = target.textContent;
        list.textContent = '';
    }
};



const getNameCity = (code) => {    // преобразование кода города в имя.
    const objCity = city.find(item => item.code === code);  // find возвращает true когда коды совпадут и запишет в objCity ВЕСЬ (!)   элемент, а не item.code
    return objCity.name;
};



const getDate = (date) => {  // меняем формат вывода даты
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

};







const getChanges = (num) => {  // кол-во пересадок
    if(num) {
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
    } else {
        return 'Без перасадок'
    }
}




const getLinkAviasales = (data) => { // формируем ссылку на билет формата https://www.aviasales.ru/search/MSQ3005MOW1 
    
    let link = 'https://www.aviasales.ru/search/';

    link += data.origin;

    const date = new Date(data.depart_date);

    const day = date.getDate();

    link += day < 10 ? '0' + day : day;  // чтобы дегь был в формате 03  а не 3 (до 10-го числа)

    const month = date.getMonth() + 1;

    link += month < 10 ? '0' + month : month;

    link += data.destination;

    link += '1'; // последняя цифра - кол-во пассажиров
    console.log(link);
    return link;
}



const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';  // вёрстка


    if(data) {  // если данные (cheapTicket[0]) пришли, то формируем вёрстку
        deep =`
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="${getLinkAviasales(data)}" target = "_blank" class="button button__buy">Купить
                    за ${data.value}</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>
        
                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
        `;

    } else {
        deep = '<h3>К сожалению, на текущую дату билетов не нашлось<h3>';
    };

    ticket.insertAdjacentHTML('afterbegin',deep);

    return ticket;
}







const renderCheapDay = (cheapTicket) => {
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';   // очистка чтобы старые рещультыты не оставались после нового submit
    cheapestTicket.style.display = 'block';
   const ticket = createCard(cheapTicket[0]);  // один самый дешёвый билет
   cheapestTicket.append(ticket);   // получили карточку
};



const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>'; // очистка чтобы старые рещультыты не оставались после нового submit
    otherCheapTickets.style.display = 'block';
    cheapTickets.sort((a,b) => a.value - b.value); // сортировка по цене

    for (let i = 0; i < cheapTickets.length && i < MAX_CARD_COUNT; i++) {  // выводим 10 карточек билетов
        const ticket = createCard(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }

    //console.log(cheapTickets); 
};






const renderCheap = (data , date) => {   // рендер рейсов
    const cheapTicketYear = JSON.parse(data).best_prices;

    /*cheapTicketYear.sort(function (a, b) {   // отсортировали по дате по возрастанию;
        if (a.depart_date > b.depart_date) {
          return 1;
        }
        if (a.depart_date < b.depart_date) {
          return -1;
        }
        // a должно быть равным b
        return 0;
      });*/

    const cheapTicketDay = cheapTicketYear.filter(item => {
        return item.depart_date === date;    // сравниваем дату из массива с той, какую мы ввели и возвращаем best price билет на это число
    });

    renderCheapDay(cheapTicketDay);
    renderCheapYear(cheapTicketYear);
};





// События

//inputCitiesFrom.addEventListener('input', showCity(inputCitiesFrom, dropdownCitiesFrom)); // просто БЕЗ КОЛБЭКА  showCity(inputCitiesFrom, dropdownCitiesFrom) - не пойдёт! Иначе сразу выполнится когда интерпритатор дойдёт сюда и потом не сработает уже!

inputCitiesFrom.addEventListener('input', ()=> {  
    showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', ()=> {  
    showCity(inputCitiesTo, dropDownCitiesTo)
});



dropdownCitiesFrom.addEventListener('click', event => {
    selectCity(event,inputCitiesFrom,dropdownCitiesFrom );
});

dropDownCitiesTo.addEventListener('click', event =>{
    selectCity(event,inputCitiesTo, dropDownCitiesTo);
});


formSearch.addEventListener('submit',(event) => {  //  ({target}) - получить сразу target
    event.preventDefault();

    //debugger;  вклюяить дебаггер в консоли разработчика

    const cityFrom = city.find(item => inputCitiesFrom.value === item.name);
    const cityTo = city.find(item => inputCitiesTo.value === item.name);

    const formData = {
        from: cityFrom,  //find - найти один элемент, который удовлетворяет условию
        to: cityTo,
        when: inputDateDepart.value
    }



    if(formData.from && formData.to ) {  // проверка на неправильное введённое название города. Если ввести неправильно, то объект не созастся. ПАроверяем создался ли объект
        const requestData = `?depaert_date=${formData.when}&origin=${formData.from.code}` + 
        `&destination=${formData.to.code}&one_way=true`;
        //const requestData2 = '?depart_date=' + formData.when + '&origin=' + formData.from + '&destination=' + formData.to + '&one_way=true';  // строка запроса


        // Запрос направлений
        getData(calendar + requestData , (response) => {  // calendar + requestData
            //console.log(response);
            renderCheap(response, formData.when);
        }, error => {                        //  обработка ошибки сервера (напр 400)  - ф-ция reject
            alert('В этом направлении нет рейсов');
            console.error('Ошибка');
        });
    } else {
        alert('Введите правильно название города!');
    }
});






//Вызовы ф-ций
//proxy + citiesAPI


// Запрос городов
getData('db/cities.json', (data) => {    // получение JSON через proxi + ФЗШ
   // console.log(JSON.parse(data));
    city = JSON.parse(data).filter(item => item.name);
    
    city.sort(function (a, b) {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });

});

/*getData(citiesAPI, (data) => {    //const getData = (url, callback)     // если инфу берём со скачанного JSON
    console.log(data);
});*/

