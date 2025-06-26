
local telescope = require("telescope")

-- keybinds --
require("which-key").register({

    t = {
        name = "[t]elescope",
        f = { ":Telescope find_files<CR>", 'Find file' },
        b = { ":Telescope buffers<CR>", 'Find buffer' },
        H = { ":Telescope help_tags<CR>", 'Find help' },
        g = { ":Telescope live_grep<CR>", 'Find string' },
    },

}, { prefix = "<leader>", mode = {"n", "v"}, noremap = true, silent = true })
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
