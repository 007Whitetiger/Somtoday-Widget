<script>
    import Footer from '$lib/Footer.svelte';
    import '../main.css'
</script>
<main>
    <section>
        <slot />
    </section>
    <Footer />    
</main>
<style>
    section {
        margin-bottom: calc(100vh / 4);
    }
    @media only screen and (min-height: 500px) {
        section {
            margin-bottom: calc(100vh / 8);
        }
    }
    
</style>