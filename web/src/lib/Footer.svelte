<script lang="ts">
    import { onMount } from "svelte";


    let footer: HTMLElement
    let smallDisplay = false;
    onMount(() => {
        smallDisplay = window.matchMedia("only screen and (max-width: 700px)").matches
        console.log(smallDisplay)
        footerScrollCheck()
    })

    const footerScrollCheck = () => {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - Math.sqrt(window.outerHeight)) {
            footer.style.bottom = "0"
        } else if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            footer.style.bottom = "-4em"
        } else if (!smallDisplay) {
            
            footer.style.bottom = "0"   
        } else {
            footer.style.bottom = "-4em"
        }
    }
</script>

<svelte:window on:scroll="{footerScrollCheck}" />

<footer 
on:mouseleave="{() => {
    footerScrollCheck()
}}" 
on:focus={() => {
    footer.style.bottom = "0";
}} 
on:mouseover={() => {
    footer.style.bottom = "0";
}} 
on:click={() => {
    footer.style.bottom = "0"
}}
bind:this={footer}
>
    <div class='left-info'>
        <div>
            Somtoday widget
        </div>
        <div>
            (C) Stijn Te Baerts
        </div>
        <div>
            <a href="mailto:dd140868@leerling.dendron.nl">Contact</a>
        </div>
    </div>
    <div class='home'>
        <a href='/'>HOME</a>
    </div>
</footer>
<style>
    .left-info {
        margin-left: 1em;
    }
    footer {
        padding: 1em 0;
        background-color: #004F9C;
        color: gray;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: bottom 0.2s;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }
    footer:hover {
        bottom: 0;
    }
    a {
        color: whitesmoke;
    }
    .home {
        text-align: center;
        align-self: center;
        font-size: x-large;
        font-weight: bold;
    }
    .home a {
        text-decoration: none;
    }
    @media only screen and (max-width: 700px) {
        footer {
            grid-template-columns: 1fr 1fr;
        }
    }
</style>