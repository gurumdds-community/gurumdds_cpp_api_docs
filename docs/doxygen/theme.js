(() => {
	const preference_key = "gurumdds-reference-theme";
	const system_theme = window.matchMedia("(prefers-color-scheme: dark)");
	const root = document.documentElement;
	const read_preference = () => {
		try {
			return localStorage.getItem(preference_key);
		} catch {
			return null;
		}
	};
	let preference = read_preference();
	let toggle;

	const apply_theme = () => {
		const is_dark = preference === null ? system_theme.matches : preference === "dark";
		root.classList.toggle("dark-mode", is_dark);
		root.classList.toggle("light-mode", !is_dark);
		toggle?.setAttribute("aria-pressed", String(is_dark));
	};

	apply_theme();
	system_theme.addEventListener("change", apply_theme);
	window.addEventListener("storage", event => {
		if (event.key === preference_key || event.key === null) {
			preference = read_preference();
			apply_theme();
		}
	});
	document.addEventListener("DOMContentLoaded", () => {
		toggle = document.querySelector(".doc-theme");
		toggle?.addEventListener("click", () => {
			preference = root.classList.contains("dark-mode") ? "light" : "dark";
			try {
				localStorage.setItem(preference_key, preference);
			} catch {
				// 테마 전환은 저장소가 제한된 브라우저에서도 동작
			}
			apply_theme();
		});
		apply_theme();
	});
})();
