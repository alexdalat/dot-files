
local telescope = require("telescope")

-- keybinds --
wk.add({
  mode = { "n", "v" },
  -- group defined in navigation.lua
  { "<leader>tf", ":Telescope find_files<CR>", desc = "Find file" },
  { "<leader>tb", ":Telescope buffers<CR>", desc = "Find buffer" },
  { "<leader>tH", ":Telescope help_tags<CR>", desc = "Find help" },
  { "<leader>tg", ":Telescope live_grep<CR>", desc = "Find string" },
})
-- end keybinds --


-- dap extension
require('telescope').load_extension('dap')

-- perfanno extension
local perfanno_actions = telescope.extensions.perfanno.actions
telescope.setup {
    extensions = {
        perfanno = {
            -- Special mappings in the telescope finders
            mappings = {
                ["i"] = {
                    -- Find hottest callers of selected entry
                    ["<C-h>"] = perfanno_actions.hottest_callers,
                    -- Find hottest callees of selected entry
                    ["<C-l>"] = perfanno_actions.hottest_callees,
                },

                ["n"] = {
                    ["gu"] = perfanno_actions.hottest_callers,
                    ["gd"] = perfanno_actions.hottest_callees,
                }
            }
        }
    }
}
