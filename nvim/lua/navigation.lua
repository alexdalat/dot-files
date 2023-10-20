require 'neo-tree'.setup {
    -- close_if_last_window = true,
    event_handlers = {
        {
            event = "file_opened",
            ---@diagnostic disable-next-line: unused-local
            handler = function(file_path)
                -- auto close
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
    -- set window size
    view = {
        width = 15,
        side = "left",
        auto_resize = false,
    }
}
