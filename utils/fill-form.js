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

    // ── Tally CustomSelect dropdown picker ────────────────────
    //
    // Tally renders dropdowns as:
    //   <div class="sc-ad4ff197-0">          ← container (CustomSelect)
    //     <input id="FIELD_ID" type="text">  ← visible text input (the ID target)
    //     <svg class="lucide-chevron-down">  ← the real open trigger (nextElementSibling)
    //   </div>
    //
    // Strategy: click container + chevron + input to guarantee React picks it up,
    // then wait for the options portal to appear in the DOM.
    async function pickOption(id, optionText) {
        const input = document.getElementById(id);
        if (!input) return console.warn('⚠ dropdown not found:', id);

        const container = input.parentElement;          // CustomSelect wrapper div
        const chevron = input.nextElementSibling;     // <svg> chevron-down

        input.scrollIntoView({ block: 'center' });
        await wait(DELAY);

        // Focus the input first
        input.focus();

        // Fire click on the chevron (the real open button in Tally's CustomSelect)
        function fire(el, type) {
            if (!el) return;
            el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        }

        // Click chevron → container → input (belt-and-suspenders)
        if (chevron) { fire(chevron, 'mousedown'); fire(chevron, 'mouseup'); fire(chevron, 'click'); }
        fire(container, 'mousedown'); fire(container, 'mouseup'); fire(container, 'click');
        fire(input, 'mousedown'); fire(input, 'mouseup'); fire(input, 'click');

        // Wait for React to mount the options portal in document.body
        await wait(200);

        const needle = optionText.trim().toLowerCase();

        function tryClick(el) {
            fire(el, 'mousedown');
            fire(el, 'mouseup');
            fire(el, 'click');
        }

        // Priority 1: ARIA role="option" (most correct, used by many React select libs)
        for (const opt of document.querySelectorAll('[role="option"]')) {
            if (opt.textContent.trim().toLowerCase().includes(needle)) {
                tryClick(opt); await wait(DELAY); return;
            }
        }

        // Priority 2: listbox children or menu class patterns
        for (const opt of document.querySelectorAll('[role="listbox"] *, [class*="menu"] *, [class*="option"]')) {
            const txt = opt.textContent.trim().toLowerCase();
            if (txt.includes(needle) && opt.children.length === 0) {
                tryClick(opt); await wait(DELAY); return;
            }
        }

        // Priority 3: any <li> or leaf visible in a portal-like overlay
        for (const opt of document.querySelectorAll('li, [data-value]')) {
            if (opt.textContent.trim().toLowerCase().includes(needle)) {
                tryClick(opt); await wait(DELAY); return;
            }
        }

        // Last resort: full leaf scan (catches bare spans in a portal)
        for (const s of document.querySelectorAll('span, div')) {
            if (s.children.length === 0 && s.textContent.trim().toLowerCase().includes(needle)) {
                tryClick(s); await wait(DELAY); return;
            }
        }

        console.warn('⚠ option not found:', optionText, '— is the dropdown open? Try: document.querySelectorAll(\'[role="option"]\')');
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
    await wait(400); // Package is the first dropdown; give React time to fully settle

    // ── Package & Language (dropdowns) ────────────────────────
    // Options: "Basic (Storybook + Coloring + Certificate)" | "Full Bundle (Basic + Video) - (coming soon)"
    //          "English (EN)" | "Ukrainian (UA) (coming soon)"
    await pickOption('31887776-4d2a-44ea-ae96-f5f7daaecee1', 'Basic');
    await wait(DELAY);
    await pickOption('86b291eb-3244-46f6-823d-edd253589f79', 'English');
    await wait(DELAY);

    // ── Child ─────────────────────────────────────────────────
    fillText('8a3daac0-7787-4aba-8688-9ab59fee4fb7', 'Charlie');
    fillText('48236c68-0d7c-4fb8-8ec8-45079d19f328', '7');

    // Gender dropdown
    await pickOption('74999247-4cdb-4100-bae9-2b25eb281ffd', 'Boy');
    await wait(DELAY);

    // Glasses → No
    tickCheckbox('checkbox_bf165698-f4fb-470b-9137-1fb717395afb');
    await wait(150); // Hair Color is first dropdown after a checkbox re-render

    // Hair color & Skin tone
    await pickOption('d7cc4e55-9628-41d6-b49b-f5e7ba91b5b2', 'Brown');
    await wait(DELAY);
    await pickOption('313ff73d-6e29-4a72-b17e-94c8863b3713', 'Light');
    await wait(DELAY);

    // ── Make It Personal ──────────────────────────────────────
    fillText('2b012bbe-7103-40ac-a512-540f15f5417e', 'Dinosaurs and space exploration');
    fillText('19463a9f-18ff-4ca7-876d-c82a1ac1e8cf',
        'Charlie has been obsessed with T-Rex since age 3. Knows every dinosaur by name and dreams of becoming a paleontologist-astronaut.');
    fillText('1f33a43a-dead-4885-b0e3-e8acb356fbad',
        'Always wears his red hoodie with a dinosaur patch, blue sneakers, and a backwards cap.');
    fillText('99708fb4-2125-40ba-bebd-226deab7793f', '7');
    fillText('b7586987-0179-4e61-b77a-9bf47e6d84a4',
        "Scored 3 goals in last Saturday's football match and the whole team celebrated!");

    // ── Story Details ─────────────────────────────────────────
    // Theme:      "Space Hero Mission"
    // Hero trait: "Brave" | "Kind" | "Smart" | "Creative"
    await pickOption('34bcbda3-81bf-4f74-ab0e-8c3bcfa398d5', 'Space');
    await wait(DELAY);
    await pickOption('3bf36870-b990-4c11-acda-119543b751e6', 'Brave');
    await wait(DELAY);

    fillText('adf26e66-acb7-44e3-80fa-70d0d994f2e2',
        'Stay curious and brave, Charlie! The universe is yours to explore. Love, Mom & Dad 🚀');

    // ── Consent ───────────────────────────────────────────────
    tickCheckbox('checkbox_0b5270f1-7208-4f83-800a-a9e65e00f143');

    console.log('✅ Done! Review the data, attach a photo manually, then Submit.');
})();
