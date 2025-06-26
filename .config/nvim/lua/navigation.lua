
-- Keybinds --

local wk = require("which-key")



wk.add({
  mode = { "n", "v" },
  { "<leader>f", ':Neotree toggle<CR>', desc = "File navigation", remap = false, silent = true },
})

-- End keybinds --



require 'neo-tree'.setup {
    -- close_if_last_window = true,
    event_handlers = {
        {
            event = "file_opened",
            ---@diagnostic disable-next-line: unused-local
            handler = function(file_path)
                -- vimc.cmd("Neotree close")
                -- OR
                require("neo-tree.command").execute({ action = "close" })
            end
        },

    },
    filesystem = {
        filtered_items = {
            visible = true, -- when true, they will just be displayed differently than normal items
            hide_dotfiles = true,
            hide_gitignored = true,
            hide_hidden = true,
            always_show = {
                ".gitignore",
            },
        },
    },
    default_component_configs = {
        name = {
            trailing_slash = true,
            use_git_status_colors = true,
        },
        git_status = {
            symbols = {
              -- Change type
              added     = "", -- or "✚", but this is redundant info if you use git_status_colors on the name
              modified  = "", -- or "", but this is redundant info if you use git_status_colors on the name
              deleted   = "✖",-- this can only be used in the git_status source
              renamed   = "󰁕",-- this can only be used in the git_status source
              -- Status type
              untracked = "",
              ignored   = "",
              unstaged  = "", -- default: "󰄱"
              staged    = "✚",
              conflict  = "",
            },
        },
    },
}

local telescope = require("telescope")
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
