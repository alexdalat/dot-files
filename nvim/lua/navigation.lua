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
            visible = false, -- when true, they will just be displayed differently than normal items
            hide_dotfiles = true,
            hide_gitignored = true,
            hide_hidden = true,
            hide_by_name = {
                --"node_modules"
            },
            hide_by_pattern = { -- uses glob style patterns
                --"*.meta",
                --"*/src/*/tsconfig.json",
            },
            always_show = {
                ".gitignore",
            },
            never_show = { -- remains hidden even if visible is toggled to true, this overrides always_show
                --".DS_Store",
                --"thumbs.db"
            },
            never_show_by_pattern = { -- uses glob style patterns
                --".null-ls_*",
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
              ignored   = "",
              unstaged  = "", -- default: "󰄱"
              staged    = "✚",
              conflict  = "",
            },
        },
    },
}
