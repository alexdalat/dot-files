
-- Keybinds --

local wk = require("which-key")
wk.add({
  mode = { "n", "v" },

  { "<leader>p", group = "Profile" },

  { "<leader>pe", ":PerfPickEvent<CR>", desc = "Pick event" },
  { "<leader>pt", ":PerfToggleAnnotations<CR>", desc = "Toggle annotations" },
  { "<leader>ph", ":PerfHottestLines<CR>", desc = "Hottest lines" },
  { "<leader>ps", ":PerfHottestSymbols<CR>", desc = "Hottest symbols" },
  { "<leader>pc", ":PerfHottestCallersFunction<CR>", desc = "Hottest callers function" },

  { "<leader>pl", group = "Load" },
  { "<leader>plf", ":PerfLoadFlat<CR>", desc = "Load flat profile" },
  { "<leader>plg", ":PerfLoadCallGraph<CR>", desc = "Load call graph" },
  { "<leader>plr", ":PerfLoadCallGraphFile<CR>", desc = "Load call graph report" },
  { "<leader>plo", ":PerfLoadFlameGraph<CR>", desc = "Load flame graph" },

  { "<leader>pp", group = "Perfanno" },
  { "<leader>ppc", ":PerfHottestCallersSelection<CR>", desc = "Hottest callers selection" },

})

-- End keybinds --


local perfanno = require("perfanno")
local util = require("perfanno.util")

local bgcolor = vim.fn.synIDattr(vim.fn.hlID("Normal"), "bg", "gui")

perfanno.setup {
    -- Creates a 10-step RGB color gradient beween bgcolor and "#CC3300"
    line_highlights = util.make_bg_highlights(bgcolor, "#CC3300", 20),
    vt_highlight = util.make_fg_highlight("#CC3300"),
}

