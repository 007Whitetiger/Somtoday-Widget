// Desktop Firefox imports
import DesktopFirefoxMaken from 'images/bladwijzer-maken/Desktop-Firefox.png';
import DesktopFirefoxInvullen from 'images/bladwijzer-invullen/Desktop-Firefox.png';

// Mobile Safari imports
// bladwijzer-van-ios-site
import MobileSafariDelen from 'images/bladwijzer-van-site/bladwijzer-van-site-ios/Mobile Safari delen.jpeg';
import MobileSafariMaken from 'images/bladwijzer-van-site/bladwijzer-van-site-ios/Mobile Safari maken.jpeg';
import MobileSafariBevestiggen from 'images/bladwijzer-van-site/bladwijzer-van-site-ios/Mobile Safari bevestiggen.jpeg';
// bladwijzer-maken-ios
import MobileSafariBladwijzerOpenen from 'images/bladwijzer-maken/bladwijzer-maken-ios/Mobile Safari bladwijzer-openen.jpeg';
import MobileSafariBladwijzerEditModus from 'images/bladwijzer-maken/bladwijzer-maken-ios/Mobile Safari edit-knop.jpeg'
import MobileSafariBladwijzerEddittenOpenen from 'images/bladwijzer-maken/bladwijzer-maken-ios/Mobile Safari bladwijzer-editten.jpeg';
import MobileSafariBladwijzerPlakken from 'images/bladwijzer-maken/bladwijzer-maken-ios/Mobile Safari bladwijzer-plakken.jpeg';

// Mobile Chrome imports
import MobileChromeMenuOption from 'images/menu-option/Mobile Chrome.jpeg';
import MobileChromeBladwijzerSiteMaken from 'images/bladwijzer-van-site/Mobile Chrome.jpg';
import MobileChromeBladwijzerPagina from 'images/bladwijzer-maken/bladwijzer-maken-chrome/Mobile Chrome bookmark-page.jpg'

export type BrowserMessage = {
    component?: string,
    text?: string,
    image?: {
        url: string,
        heigth?: string,
        width?: string,
        alt?: string
    },
    html?: boolean
}

const default_start = [
    {
        text: "<h3>Bladwijzer maken</h3>",
        html: true
    },
    {
        text: "<h4>Kopieer bladwijzer</h4>",
        html: true
    },
    {
        component: "copy"
    },
    {
        text: "<h4>Maak bladwijzer</h4>",
        html: true
    },
]

const default_ending = [
    {
        text: "<p>Ga nu naar somtoday, agenda (<a target='about:blank' href='https://somtoday.nl'>https://somtoday.nl</a>)</p>",
        html: true
    },
    { // TODO Add images
        text: "Klik op de bladwijzer die je net gemaakt hebt!"
    }
]

export const browsers: Record<string, BrowserMessage[]> = {
    "mobile-Chrome": [
        ...default_start,
        {
            text: "Open menu",
            image: {
                url: MobileChromeMenuOption
            }
        },
        {
            text: "druk op het sterretje om een bladwijzer te maken van de site",
            image: {
                url: MobileChromeBladwijzerSiteMaken
            }
        },
        {
            text: "Open menu opnieuw",
            image: {
                url: MobileChromeMenuOption
            }
        },
        {
            text: "Open bladwijzer pagina",
            image: {
                url: MobileChromeBladwijzerPagina
            }
        }
    ], 
    "desktop-Chrome": [

    ],
    "mobile-Chromium": [

    ],
    "desktop-Chromium": [

    ],
    "mobile-Edge": [

    ],
    "desktop-Edge": [

    ],
    "mobile-Safari": [
        ...default_start,
        {
            text: "Ga naar delen",
            image: {
                url: MobileSafariDelen,
                heigth: "100px"
            }
        },
        {
            text: "Voeg bladwijzer toe",
            image: {
                url: MobileSafariMaken,
                
            }
            
        },
        {
            text: "sla de bladwijzer op",
            image: {
                url: MobileSafariBevestiggen
            }
        },
        {
            text: "open bladwijzers",
            image: {
                url: MobileSafariBladwijzerOpenen
            }
        },
        {
            text: "ga in edit modus",
            image: {
                url: MobileSafariBladwijzerEditModus
            }
        },
        {
            text: "open de bladwijzer in edit modus",
            image: {
                url: MobileSafariBladwijzerEddittenOpenen
            }
        },
        {
            text: "plak de bladwijzer die je hierboven gekopiëerd hebt",
            image: {
                url: MobileSafariBladwijzerPlakken
            }
        },
        ...default_ending
    ],
    "desktop-Safari": [

    ],
    "mobile-Firefox": [
        {
            "text": "<h1>Mobile Firefox isn't suported. (because of a bug)</h1>",
            html: true
        },
        {
            "text": "To do setup please follow the setup of a different browser:"
        },
        {
            text: `
                <p><a href="/mobile/Chrome">Google Chrome (preffered android)</a></p>
                <p><a href="/mobile/Safari">Safari (preffered ios)</a></p>
            `,
            html: true
        }
    ],
    "desktop-Firefox": [
        ...default_start,
        {
            text: "Maak een bladwijzer aan door met je rechtermuis knop te klikken op de Bookmarks Toolbar",
            image: {
                url: DesktopFirefoxMaken,
            }
        },
        {
            text: "Url is wat je gekopieerd hebt en de naam mag je zelf kiezen. Bijvoorbeeld:",
            image: {
                url: DesktopFirefoxInvullen,
            }
        },
        {
            text: "<noscript><h5>Zorg ervoor dat je voor de volgende stap javascript aan hebt!</h5></noscript>",
            html: true
        },
        ...default_ending
    ],
    "mobile-Samsung Browser": [

    ]
}
export const easyCompatabilityCheck: {
    mobile: string[],
    desktop: string[]
} = {
    mobile: [],
    desktop: []
}

for (const browser of Object.keys(browsers)) {
    const splitBrowserType = <["mobile" | "desktop", string]> browser.split("-");
    easyCompatabilityCheck[splitBrowserType[0]].push(splitBrowserType[1]);
}
