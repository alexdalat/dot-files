
-- Keybinds --

local wk = require("which-key")
wk.register({
    p = {
        name = "Profile",
        l = {
            name = "Load",
            f = { ":PerfLoadFlat<CR>", 'Load flat profile' },
            g = { ":PerfLoadCallGraph<CR>", 'Load call graph' },
            r = { ":PerfLoadCallGraphFile<CR>", 'Load call graph report' },
            o = { ":PerfLoadFlameGraph<CR>", 'Load flame graph' },
        },
        e = { ":PerfPickEvent<CR>", 'Pick event' },
        t = { ":PerfToggleAnnotations<CR>", 'Toggle annotations' },
        h = { ":PerfHottestLines<CR>", 'Hottest lines' },
        s = { ":PerfHottestSymbols<CR>", 'Hottest symbols' },
        c = { ":PerfHottestCallersFunction<CR>", 'Hottest callers function' },
        pc = { ":PerfHottestCallersSelection<CR>", 'Hottest callers selection', mode = "v" },
    },
}, { prefix = "<leader>", mode = {"n", "v"}, noremap = true, silent = true })

-- End keybinds --


local perfanno = require("perfanno")
local util = require("perfanno.util")

local bgcolor = vim.fn.synIDattr(vim.fn.hlID("Normal"), "bg", "gui")

perfanno.setup {
    -- Creates a 10-step RGB color gradient beween bgcolor and "#CC3300"
    line_highlights = util.make_bg_highlights(bgcolor, "#CC3300", 20),
    vt_highlight = util.make_fg_highlight("#CC3300"),
}

