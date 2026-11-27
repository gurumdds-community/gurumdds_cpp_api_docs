
(() => {
    const korean = document.documentElement.lang === "ko";
    document.body.classList.toggle("dds-home-page", /\/(?:index\.html)?$/.test(location.pathname));
    const directoryPage = /\/(?:topics|modules|examples|dds_examples_(?:new|legacy)|group__dds__api__modules|group__dds__howto)\.html$/;
    document.body.classList.toggle("dds-directory-page", directoryPage.test(location.pathname));
    const label = (en, ko) => korean ? ko : en;
    const button = (caption, onClick) => {
        const control = document.createElement("button");
        control.type = "button";
        control.textContent = caption;
        control.addEventListener("click", onClick);
        return control;
    };

    const navControls = [];
    for (const [id, state, caption] of [
        ["side-nav", "dds-nav-open", label("Open navigation", "탐색 열기")],
        ["page-nav", "dds-outline-open", label("On this page", "이 페이지의 목차")],
    ]) {
        const panel = document.getElementById(id);
        if (!panel) continue;
        const setOpen = (open) => {
            document.body.classList.toggle(state, open);
            control.setAttribute("aria-expanded", String(open));
        };
        const control = button(caption, () => {
            const show = !document.body.classList.contains(state);
            navControls.forEach(close => close(false));
            setOpen(show);
        });
        control.className = "dds-mobile-nav";
        control.setAttribute("aria-controls", id);
        control.setAttribute("aria-expanded", "false");
        document.getElementById("top")?.append(control);
        document.body.classList.add("dds-mobile-ready");
        navControls.push(setOpen);
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && document.body.classList.contains(state)) {
                setOpen(false);
                control.focus();
            }
        });
    }

    const declaration = document.querySelector("[data-dds-signatures]");
    declaration?.addEventListener("toggle", () => {
        document.documentElement.classList.toggle("dds-show-signatures", declaration.open);
    });

    const copyCode = async (text) => {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch {
                // A local file can restrict the clipboard API.
            }
        }
        const buffer = document.createElement("textarea");
        buffer.value = text;
        buffer.style.position = "fixed";
        buffer.style.opacity = "0";
        document.body.append(buffer);
        buffer.select();
        const copied = document.execCommand("copy");
        buffer.remove();
        if (!copied) throw new Error("Copy unavailable");
    };

    for (const block of document.querySelectorAll("main article pre")) {
        const actions = document.createElement("div");
        actions.className = "dds-code-actions";
        const wrap = button(label("Wrap lines", "줄바꿈"), () => {
            wrap.setAttribute("aria-pressed", String(block.classList.toggle("dds-code-wrap")));
        });
        wrap.setAttribute("aria-pressed", "false");
        const copy = button(label("Copy code", "코드 복사"), async () => {
            try {
                await copyCode(block.textContent);
                status.textContent = label("Copied", "복사됨");
            } catch {
                status.textContent = label("Select the code to copy", "코드를 선택해 복사하세요");
            }
            copy.focus();
        });
        const status = document.createElement("span");
        status.setAttribute("role", "status");
        actions.append(wrap, copy, status);
        block.before(actions);
    }

    for (const figure of document.querySelectorAll(".image, figure.m-figure, figure.dds-inheritance")) {
        const graphic = figure.querySelector('img[src^="dds-diagram-"], object[data^="dds-diagram-"], svg[data-dds-diagram], .dds-inheritance-graph > svg');
        if (!graphic) continue;
        figure.classList.add("dds-resizable-diagram");
        const open = button(label("Enlarge diagram", "그림 확대"), () => {
            const dialog = document.createElement("dialog");
            dialog.className = "dds-diagram-dialog";
            const close = button(label("Close", "닫기"), () => dialog.close());
            const viewport = document.createElement("div");
            const enlarged = graphic.cloneNode(true);
            const ids = new Map();
            for (const node of [enlarged, ...enlarged.querySelectorAll("[id]")]) {
                if (!node.id) continue;
                const id = "dds-enlarged-" + node.id;
                ids.set(node.id, id);
                node.id = id;
            }
            if (ids.size) {
                for (const node of [enlarged, ...enlarged.querySelectorAll("*")]) {
                    for (const attr of [...node.attributes]) {
                        const value = attr.value.replace(/url\(#([^)]*)\)/g,
                            (_, id) => "url(#" + (ids.get(id) || id) + ")");
                        const rewritten = attr.localName === "href" && ids.has(value.slice(1)) ?
                            "#" + ids.get(value.slice(1)) : value;
                        if (rewritten !== attr.value) attr.value = rewritten;
                    }
                }
            }
            viewport.append(enlarged);
            dialog.append(close, viewport);
            document.body.append(dialog);
            dialog.addEventListener("close", () => {
                dialog.remove();
                open.focus();
            }, {once: true});
            dialog.showModal();
            close.focus();
        });
        open.className = "dds-diagram-action";
        figure.append(open);
    }
})();
