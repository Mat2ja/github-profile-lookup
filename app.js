// DOM Elements
const formEl = document.querySelector('form');
const main = document.querySelector('#main');
const searchbar = document.querySelector('.header__searchbar');

async function getUser(user = 'egoist') {
    const { data } = await axios.get(`https://api.github.com/users/${user}`)
    displayUser(data);
    showMoreInfo(data);
};

function showMoreInfo(data) {
    const statsEl = document.querySelectorAll('.profile__stat');

    getRepos(data.repos_url);
    document.querySelector('.profile__stat--repos').classList.add('active');

    statsEl.forEach((stat) => {
        stat.addEventListener('click', async () => {
            // remove all active classes
            statsEl.forEach(stat => stat.classList.remove('active'));
            stat.classList.add('active');

            if (stat.classList.contains('profile__stat--followers')) {
                await getUsers(data.followers_url);
                const users = document.querySelectorAll('.profile__target-element');
                users.forEach((user) => {
                    user.addEventListener('click', () => getUser(user.innerText))
                })
            } else if (stat.classList.contains('profile__stat--following')) {
                await getUsers(`https://api.github.com/users/${data.login}/following`);
                const users = document.querySelectorAll('.profile__target-element');
                users.forEach((user) => {
                    user.addEventListener('click', () => getUser(user.innerText))
                })
            } else if (stat.classList.contains('profile__stat--repos')) {
                await getRepos(data.repos_url);
            }
        })
    })
}

async function getUsers(url) {
    const { data: users } = await axios.get(`${url}`);
    addUsersToCard(users);
}

async function getRepos(url) {
    const { data: repos } = await axios.get(`${url}?per_page=100`);
    addReposToCard(repos);
}

function addUsersToCard(users) {
    const targetEl = document.getElementById("target");
    targetEl.innerHTML = '';

    users
        .slice(0, 14)
        .forEach(user => {
            const userEl = document.createElement('a');
            userEl.innerText = user.login;
            userEl.classList.add('profile__target-element');
            // userEl.href = user.html_url;
            userEl.target = '_blank'
            targetEl.append(userEl);
        });
}


function addReposToCard(repos) {
    const targetEl = document.getElementById("target");
    targetEl.innerHTML = '';

    repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .sort((a, b) => b.watchers_count - a.watchers_count)
        .slice(0, 10)
        .forEach(repo => {
            const repoEl = document.createElement('a');
            repoEl.innerText = repo.name;
            repoEl.classList.add('profile__target-element');
            repoEl.href = repo.html_url;
            repoEl.target = '_blank'
            targetEl.append(repoEl);
        });
}

function displayUser(user) {
    const {
        login,
        id,
        node_id,
        avatar_url,
        gravatar_id,
        url,
        html_url,
        followers_url,
        following_url,
        gists_url,
        starred_url,
        subscriptions_url,
        organizations_url,
        repos_url,
        events_url,
        received_events_url,
        type,
        site_admin,
        name,
        company,
        blog,
        location,
        email,
        hireable,
        bio,
        twitter_username,
        public_repos,
        public_gists,
        followers,
        following,
        created_at,
        updated_at
    } = user;
    console.log(user);

    // console.log('BLOG:', blog);
    // todo remove blog icon
    let blogName = blog;
    let blogLink = blog;
    if (blog) {
        // make link usable
        if (!(/http[s]?/).test(blog)) {
            blogLink = 'https://' + blog;
        }
        // show prettier link
        blogName = blogName.replace(/^https?\:\/\//i, "");
    }

    let flagUrl = '';
    try {
        // TODO > agasking1337 Romania
        let locationArr = location.split(',');
        // Loop over location names
        for (let loc of locationArr) {
            loc = loc.trim();

            // capitalize first letter of country
            loc = loc.replace(/(^\w|\s\w)/g, m => m.toUpperCase())
            // If country found
            if (Object.keys(isoCountries).includes(loc)) {
                // console.log('Found counry! > ', loc, isoCountries[loc]);

                const countryCode = isoCountries[loc]
                flagUrl = `https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`;
                break;
            } else {
            }
        }
    } catch (err) {
        console.log(err);
    }

    let flagImg = '';
    if (flagUrl) {
        flagImg = `<img src="${flagUrl}" alt="" class="profile__flag">`
    };

    const profileHtml = `
        <div class="profile">
            <div class="profile__grid">
                <div class="profile__photo">
                    <img src="${avatar_url}" alt="">
                </div>
                <div class="profile__description">
                    <div class="profile__name">
                        <div class="profile__name-wrapper">
                            <span class="profile__name--full">${name || ''}</span>
                            ${flagImg}
                        </div>
                        <div class="profile__name-wrapper">
                            <i class="las la-at" id="at-icon"></i>
                            <a href='https://github.com/${login}' target='_blank' class="profile__name--username">${login}</a>
                            <i class="las la-laptop" id="blog-icon"></i>
                            <span class="profile__blog">
                                <a href="${blogLink}" class="profile__blog-link" target="_blank">${blogName}</a>
                            </span>
                        </div>
                    </div>
                    <div class="profile__bio">${bio || ''}</div>
                    <ul class="profile__stats">
                        <li class="profile__stat profile__stat--followers">
                            <span class="profile__stat--count">${followers.toLocaleString()}</span>
                            <span class="profile__stat--label">Followers</span>
                        </li>
                        <li class="profile__stat profile__stat--following">
                            <span class="profile__stat--count">${following.toLocaleString()}</span>
                            <span class="profile__stat--label">Following</span>
                        </li>
                        <li class="profile__stat profile__stat--repos">
                            <span class="profile__stat--count">${public_repos.toLocaleString()}</span>
                            <span class="profile__stat--label">Repos</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class='profile__target' id='target'></div>
        </div>
    `;

    main.innerHTML = profileHtml;
}



formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = searchbar.value.trim();
    if (user) {
        await getUser(user);
        searchbar.value = '';
        searchbar.blur();
    }
})

const isoCountries = {
    'Afghanistan': 'AF',
    'Aland Islands': 'AX',
    'Albania': 'AL',
    'Algeria': 'DZ',
    'American Samoa': 'AS',
    'Andorra': 'AD',
    'Angola': 'AO',
    'Anguilla': 'AI',
    'Antarctica': 'AQ',
    'Antigua And Barbuda': 'AG',
    'Argentina': 'AR',
    'Armenia': 'AM',
    'Aruba': 'AW',
    'Australia': 'AU',
    'Austria': 'AT',
    'Azerbaijan': 'AZ',
    'Bahamas': 'BS',
    'Bahrain': 'BH',
    'Bangladesh': 'BD',
    'Barbados': 'BB',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bermuda': 'BM',
    'Bhutan': 'BT',
    'Bolivia': 'BO',
    'Bosnia And Herzegovina': 'BA',
    'Botswana': 'BW',
    'Bouvet Island': 'BV',
    'Brazil': 'BR',
    'British Indian Ocean Territory': 'IO',
    'Brunei Darussalam': 'BN',
    'Bulgaria': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cambodia': 'KH',
    'Cameroon': 'CM',
    'Canada': 'CA',
    'Cape Verde': 'CV',
    'Cayman Islands': 'KY',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Chile': 'CL',
    'China': 'CN',
    'Christmas Island': 'CX',
    'Cocos (Keeling) Islands': 'CC',
    'Colombia': 'CO',
    'Comoros': 'KM',
    'Congo': 'CG',
    'Congo, Democratic Republic': 'CD',
    'Cook Islands': 'CK',
    'Costa Rica': 'CR',
    'Cote D\'Ivoire': 'CI',
    'Croatia': 'HR',
    'Cuba': 'CU',
    'Cyprus': 'CY',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Djibouti': 'DJ',
    'Dominica': 'DM',
    'Dominican Republic': 'DO',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'El Salvador': 'SV',
    'England': 'gb-eng',
    'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER',
    'Estonia': 'EE',
    'Ethiopia': 'ET',
    'Falkland Islands': 'FK',
    'Faroe Islands': 'FO',
    'Fiji': 'FJ',
    'Finland': 'FI',
    'France': 'FR',
    'French Guiana': 'GF',
    'French Polynesia': 'PF',
    'French Southern Territories': 'TF',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Georgia': 'GE',
    'Germany': 'DE',
    'Ghana': 'GH',
    'Gibraltar': 'GI',
    'Greece': 'GR',
    'Greenland': 'GL',
    'Grenada': 'GD',
    'Guadeloupe': 'GP',
    'Guam': 'GU',
    'Guatemala': 'GT',
    'Guernsey': 'GG',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Guyana': 'GY',
    'Haiti': 'HT',
    'Heard Island & Mcdonald Islands': 'HM',
    'Holy See (Vatican City State)': 'VA',
    'Honduras': 'HN',
    'Hong Kong': 'HK',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran, Islamic Republic Of': 'IR',
    'Iraq': 'IQ',
    'Ireland': 'IE',
    'Isle Of Man': 'IM',
    'Israel': 'IL',
    'Italy': 'IT',
    'Jamaica': 'JM',
    'Japan': 'JP',
    'Jersey': 'JE',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Kiribati': 'KI',
    'Korea': 'KR',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Lao People\'s Democratic Republic': 'LA',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libyan Arab Jamahiriya': 'LY',
    'Liechtenstein': 'LI',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Macao': 'MO',
    'Macedonia': 'MK',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Malaysia': 'MY',
    'Maldives': 'MV',
    'Mali': 'ML',
    'Malta': 'MT',
    'Marshall Islands': 'MH',
    'Martinique': 'MQ',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Mayotte': 'YT',
    'Mexico': 'MX',
    'Micronesia, Federated States Of': 'FM',
    'Moldova': 'MD',
    'Monaco': 'MC',
    'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Montserrat': 'MS',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Myanmar': 'MM',
    'Namibia': 'NA',
    'Nauru': 'NR',
    'Nepal': 'NP',
    'Netherlands': 'NL',
    'Netherlands Antilles': 'AN',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    'Nicaragua': 'NI',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Niue': 'NU',
    'Norfolk Island': 'NF',
    'Northern Mariana Islands': 'MP',
    'Norway': 'NO',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palau': 'PW',
    'Palestinian Territory, Occupied': 'PS',
    'Panama': 'PA',
    'Papua New Guinea': 'PG',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Pitcairn': 'PN',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Puerto Rico': 'PR',
    'Qatar': 'QA',
    'Reunion': 'RE',
    'Romania': 'RO',
    'Russian Federation': 'RU',
    'Rwanda': 'RW',
    'Saint Barthelemy': 'BL',
    'Saint Helena': 'SH',
    'Saint Kitts And Nevis': 'KN',
    'Saint Lucia': 'LC',
    'Saint Martin': 'MF',
    'Saint Pierre And Miquelon': 'PM',
    'Saint Vincent And Grenadines': 'VC',
    'Samoa': 'WS',
    'San Marino': 'SM',
    'Sao Tome And Principe': 'ST',
    'Saudi Arabia': 'SA',
    'Scotland': 'gb-sct',
    'Senegal': 'SN',
    'Serbia': 'RS',
    'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Singapore': 'SG',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Solomon Islands': 'SB',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Georgia And Sandwich Isl.': 'GS',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'Sudan': 'SD',
    'Suriname': 'SR',
    'Svalbard And Jan Mayen': 'SJ',
    'Swaziland': 'SZ',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Syrian Arab Republic': 'SY',
    'Taiwan': 'TW',
    'Tajikistan': 'TJ',
    'Tanzania': 'TZ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL',
    'Togo': 'TG',
    'Tokelau': 'TK',
    'Tonga': 'TO',
    'Trinidad And Tobago': 'TT',
    'Tunisia': 'TN',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'Turks And Caicos Islands': 'TC',
    'Tuvalu': 'TV',
    'Uganda': 'UG',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'United States': 'US',
    'US': 'US',
    'USA': 'US',
    'United States Outlying Islands': 'UM',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'Vanuatu': 'VU',
    'Venezuela': 'VE',
    'Vietnam': 'VN',
    'Virgin Islands, British': 'VG',
    'Virgin Islands, U.S.': 'VI',
    'Wales': 'gb-wls',
    'Wallis And Futuna': 'WF',
    'Western Sahara': 'EH',
    'Yemen': 'YE',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW'
};