// Paste into Chrome DevTools console on https://tally.so/r/rj6gMX
// Fills all fields with dummy data. Submit manually after reviewing.

(async () => {
    const DELAY = 50;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    // ── Set value on React-controlled input/textarea ──────────
    function setNativeValue(el, value) {
        const proto = el.tagName === 'TEXTAREA'
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function fillText(id, value) {
        const el = document.getElementById(id);
        if (!el) return console.warn('⚠ not found:', id);
        el.scrollIntoView({ block: 'center' });
        el.focus();
        setNativeValue(el, value);
        el.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    // ── Click a Tally custom dropdown + select an option ──────
    async function pickOption(id, optionText) {
        const el = document.getElementById(id);
        if (!el) return console.warn('⚠ dropdown not found:', id);

        // Scroll into view and open dropdown
        el.scrollIntoView({ block: 'center' });


        // Simulate real mouse events to trigger Tally's React handlers
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        el.focus();
        await wait(DELAY);

        // Find matching option — Tally renders options as spans/divs in a popup
        const needle = optionText.toLowerCase();
        const allOptions = document.querySelectorAll(
            '[role="option"], [role="listbox"] > *, [class*="option"], [class*="menu"] span, [class*="dropdown"] span'
        );

        let found = false;
        for (const opt of allOptions) {
            if (opt.textContent.trim().toLowerCase().includes(needle)) {
                opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                opt.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                opt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                found = true;
                break;
            }
        }

        // Fallback: search ALL spans on page (Tally may use a portal/overlay)
        if (!found) {
            const spans = document.querySelectorAll('span, div, li');
            for (const s of spans) {
                const txt = s.textContent.trim().toLowerCase();
                // Match exactly or partially, but only leaf nodes (no duplicates from parents)
                if (txt === needle || (txt.includes(needle) && s.children.length === 0)) {
                    s.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    s.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                    s.click();
                    found = true;
                    break;
                }
            }
        }

        if (!found) console.warn('⚠ option not found:', optionText);

    }

    function tickCheckbox(id) {
        const el = document.getElementById(id);
        if (!el) return console.warn('⚠ checkbox not found:', id);
        if (!el.checked) {
            el.click();
            // Tally wraps checkboxes in labels — try parent if direct click didn't work
            if (!el.checked) {
                const label = el.closest('label') || document.querySelector(`label[for="${id}"]`);
                if (label) label.click();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  FILL THE FORM
    // ═══════════════════════════════════════════════════════════
    console.log('🚀 Filling EverMagic form…');

    // ── Contact ───────────────────────────────────────────────
    fillText('182476de-ca22-407f-ab9e-ca91bf400f76', 'test@evermagic.com');


    // ── Package & Language (dropdowns) ────────────────────────
    // Actual option text from your form:
    //   Package:  "Basic (PDF + printable)" | "Full Bundle (Video + PDF + printable)"
    //   Language: "English (EN)" | "Українська (UA)"  (adjust if different)
    await pickOption('31887776-4d2a-44ea-ae96-f5f7daaecee1', 'Full Bundle');
    await pickOption('86b291eb-3244-46f6-823d-edd253589f79', 'English');

    // ── Child ─────────────────────────────────────────────────
    fillText('8a3daac0-7787-4aba-8688-9ab59fee4fb7', 'Charlie');
    fillText('48236c68-0d7c-4fb8-8ec8-45079d19f328', '7');

    // Gender dropdown
    await pickOption('74999247-4cdb-4100-bae9-2b25eb281ffd', 'Boy');

    // Glasses → No
    tickCheckbox('checkbox_bf165698-f4fb-470b-9137-1fb717395afb');


    // Hair color & Skin tone (dropdowns)
    await pickOption('d7cc4e55-9628-41d6-b49b-f5e7ba91b5b2', 'Brown');
    await pickOption('313ff73d-6e29-4a72-b17e-94c8863b3713', 'Light');

    // ── Make It Personal ──────────────────────────────────────
    fillText('2b012bbe-7103-40ac-a512-540f15f5417e',
        'Dinosaurs and space exploration');
    fillText('19463a9f-18ff-4ca7-876d-c82a1ac1e8cf',
        'Charlie has been obsessed with T-Rex since age 3. Knows every dinosaur by name and dreams of becoming a paleontologist-astronaut.');
    fillText('1f33a43a-dead-4885-b0e3-e8acb356fbad',
        'Always wears his red hoodie with a dinosaur patch, blue sneakers, and a backwards cap.');
    fillText('99708fb4-2125-40ba-bebd-226deab7793f', '7');
    fillText('b7586987-0179-4e61-b77a-9bf47e6d84a4',
        "Scored 3 goals in last Saturday's football match and the whole team celebrated!");

    // ── Story Details ─────────────────────────────────────────
    // Theme options:  "Space Hero Mission" | etc. (adjust to your actual values)
    // Hero trait:     "Brave" | "Kind" | "Smart" | "Creative" | etc.
    await pickOption('34bcbda3-81bf-4f74-ab0e-8c3bcfa398d5', 'Space');
    await pickOption('3bf36870-b990-4c11-acda-119543b751e6', 'Brave');

    fillText('adf26e66-acb7-44e3-80fa-70d0d994f2e2',
        'Stay curious and brave, Charlie! The universe is yours to explore. Love, Mom & Dad 🚀');

    // ── Consent ───────────────────────────────────────────────
    tickCheckbox('checkbox_0b5270f1-7208-4f83-800a-a9e65e00f143');

    console.log('✅ Done! Review the data, attach a photo manually, then Submit.');
})();
