<script lang='ts'>

    import { getBrowserAndDevice } from "$lib/browserParser";
    import { easyCompatabilityCheck } from "$lib/supportedBrowsers";

    const {browser, device} = getBrowserAndDevice();
    let mobile: boolean = ["mobile", "tablet"].includes(device.type || "");

    let mobileMessage: "mobile" | "desktop" = mobile ? "mobile" : "desktop"

    const isSupportedBrowser = easyCompatabilityCheck[mobileMessage].includes(browser.name || "")


</script>
<div class='index-page'>
    <div class='index-container'>
        <div class='header-text'>Je gebruikt:</div>
        {#if isSupportedBrowser}
            <h2><a href="/{mobileMessage}/{browser.name}">{mobileMessage} {browser.name}</a></h2>
        {:else}
            <h2>Niet Herkend</h2>
        {/if}
        <p>{isSupportedBrowser ? "Als dit niet klopt zoek de correcte" : "Zoek de correcte browser"}</p>
        <div>
            <div class='header-text'>Mobile</div>
            {#each easyCompatabilityCheck["mobile"] as mobileBrowser}
                <a class='browser-link' href="/mobile/{mobileBrowser}">
                    {mobileBrowser}
                </a>
            {/each}
            <div class='header-text'>Desktop</div>
            {#each easyCompatabilityCheck["desktop"] as desktopBrowser}
                <a class='browser-link' href="/desktop/{desktopBrowser}">
                    {desktopBrowser}
                </a>
            {/each}
            <div class='header-text'>Anders</div>
            <a class='browser-link' href='/mobile/default'>Overig mobiel</a>
            <a class='browser-link' href='/desktop/default'>Overig desktop</a>
        </div>
    </div>
    
</div>

<style>
    .index-page {
        margin-top: 2em;
        display: flex;
        justify-content: center;
        text-align: center;
    }
    .header-text {
        font-size: 20px;
        margin: 0.5em 0;
    }
    .browser-link {
        font-size: large;
        text-decoration: none;
        color: #ffc600;
    }
    .browser-link:hover {
        text-decoration: underline;
        color: #ad8a09;
    }
    a {
        display: block;
    }
</style>