<script lang="ts" context='module'>
import { browsers, easyCompatabilityCheck } from "$lib/supportedBrowsers";

    import type { Load } from "./__types/[browserName]";


    export const load: Load = ({params}) => {
        if (!easyCompatabilityCheck[<"mobile" | "desktop">params.deviceType]?.includes(params.browserName)) {
            return {
                status: 307,
                
                redirect: "/?error=deviceorbrowser",
                
            }
        }
        return {
            props: {
                currentBrowserMessages: browsers[`${params.deviceType}-${params.browserName}`]
            }
        }
    }
</script>

<script lang='ts'>
    import type {BrowserMessage} from '$lib/supportedBrowsers'
    import CopyComponent from "$lib/CopyComponent.svelte";
    export let currentBrowserMessages: BrowserMessage[];
    const componentList: Record<string, any> = {
        "copy": CopyComponent
    }
</script>

<div class='main-wrapper'>
    <div class='left-width'>
        <h3>Setup</h3>
        <p>Om je widget in te stellen hebben we je rooster nodig. Om je rooster te krijgen, moet je eerst een bladwijzer maken. Daarna zullen we deze bladwijzer gebruiken op de somtoday website om zo je rooster om te zetten naar een bestand dat de widget kan lezen.</p>
        <p>Lees dit voor een handleiding:</p>
    </div>
    
    {#each currentBrowserMessages as browserMessage}
        <div class='browser-content'>
            {#if browserMessage.component}
                <svelte:component this={componentList[browserMessage.component]} />
            {:else if browserMessage.text}
                {#if browserMessage.image}
                    <img
                        src={browserMessage.image.url} 
                        alt={browserMessage.image.alt || (() => {
                            let browserMessageUrl = browserMessage.image.url.split("/")
                            return browserMessageUrl[browserMessageUrl.length - 2]
                        })()}    
                    />
                {:else}
                    <div></div>
                {/if}
                {#if browserMessage.html}
                    <div class='html-content'>
                        {@html browserMessage.text}
                    </div>
                {:else}
                    <p class:has_image={browserMessage.image}>{browserMessage.text}</p>
                {/if}
                
            {:else}
                <h4>Invalid!</h4>
            {/if}
        </div>
    {/each}
</div>

<style>
    
    .browser-content img {
        border: 2px solid black;
        height: auto;
        max-width: 95vw;
    }
    h3, h4 {
        margin: 0;
    }

    .browser-content {
        display: grid;
    }

    
    @media only screen and (max-width: 700px) {
        .browser-content {
            grid-template-rows: max-content 1fr;
            
            justify-content: center;
            justify-items: center;
            align-items: center;
            gap: 6px;
        }
        .browser-content img {
            max-width: 70vw;
        }
        h3, h4 {
            justify-self: start;
        }
        .has_image {
            text-align: center;
            font-size: larger;

        }
    }

    @media only screen and (min-width: 700px) {
        .left-width {
            max-width: 50vw;
        }
        .browser-content {
            grid-template-columns: min-content 1fr;
            justify-content: left;
            column-gap: 5px;
            margin: 2px;
            row-gap: 0;
            font-size: larger;
            align-items: center;
        }
        .browser-content img {
            
            height: var(--image-height);
            width: var(--image-width);
            width: 50vw;
        }
        .has_image {
            max-width: 20vw;
        }
            

    }
    
</style>
