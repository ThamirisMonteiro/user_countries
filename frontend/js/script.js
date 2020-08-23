let globalUsers = [];
let globalCountries = [];
let globalUserCountries = [];
let globalFilteredUserCountries = [];

async function start() {
  console.time('measure');
  const p1 = promiseUsers();
  const p2 = promiseCountries();
  await Promise.all([p1, p2]);
  console.timeEnd('measure');
  hideSpinner();
  mergeUsersAndCountries();
  render();
  enableFilter();
}

function promiseUsers() {
  return new Promise(async (resolve, reject) => {
    await fetchUsers();
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

function promiseCountries() {
  return new Promise(async (resolve, reject) => {
    await fetchCountries();
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function fetchUsers() {
  const response = await fetch('http://localhost:3002/users');
  const json = await response.json();
  globalUsers = json.map(({ name, picture, login, nat }) => {
    return {
      userId: login.uuid,
      userCountry: nat,
      userName: name.first,
      userPicture: picture.thumbnail,
    };
  });
}

async function fetchCountries() {
  const response = await fetch('http://localhost:3001/countries');
  const json = await response.json();
  globalCountries = json.map(({ name, flag, alpha2Code }) => {
    return {
      countryId: alpha2Code,
      countryName: name,
      countryFlag: flag,
    };
  });
}

function hideSpinner() {
  document.querySelector('#idSpinner').classList.add('hide');
}

function mergeUsersAndCountries() {
  globalUserCountries = [];
  globalUsers.forEach((user) => {
    const country = globalCountries.find(
      (country) => country.countryId === user.userCountry
    );

    const { countryName, countryFlag } = country;

    globalUserCountries.push({
      ...user,
      countryName,
      countryFlag,
    });

    globalUserCountries.sort((a, b) => a.userName.localeCompare(b.userName));
    globalFilteredUserCountries = [...globalUserCountries];
  });
}

function render() {
  const divUsers = document.querySelector('#divUsers');
  divUsers.innerHTML = `
    <div class='row'>
      ${globalFilteredUserCountries
        .map(({ countryFlag, userPicture, userName, countryName }) => {
          return `
          <div class='col s6 m4 l3'>
            <div class='flex-row bordered'>
              <img class='avatar' src='${userPicture}' alt='${userName}' />
              <div class='flex-column'>
                <span>${userName}</span>
                <img class='flag' src='${countryFlag}' alt='${countryName}' />
              </div>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}

function enableFilter() {
  const inputFilter = document.querySelector('#inputFilter');
  inputFilter.addEventListener('keyup', handleKeyUp);
}

function handleKeyUp() {
  const inputFilter = document.querySelector('#inputFilter');
  const filterValue = inputFilter.value.trim();
  globalFilteredUserCountries = globalUserCountries.filter((item) => {
    return item.userName.toLowerCase().includes(filterValue);
  });
  render();
}

start();
