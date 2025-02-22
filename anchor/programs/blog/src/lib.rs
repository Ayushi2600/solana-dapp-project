use anchor_lang::prelude::*;

declare_id!("6oppHjv5Nzxg2DrrtHHQZ7qAgMVDszTf9JHBMgYNt5dU");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod blog {
    use super::*;

    pub fn create_blog(ctx: Context<CreateBlog>, title: String, description: String) -> Result<()> {
       msg!("Creating a blog!!!");
       msg!("Title: {}", title);
       msg!("Description: {}", description);


        let blog_entry = &mut ctx.accounts.blog_entry;
        blog_entry.owner = ctx.accounts.owner.key();
        blog_entry.title = title;
        blog_entry.description = description;
        Ok(())
    }

    pub fn update_blog(
        ctx: Context<UpdateBlog>,
        title: String,
        new_description: String,
    ) -> Result<()> {
        msg!("Blog Entry Updated for title: {}", title);
        msg!("New Message: {}", new_description);
    
        let blog_entry = &mut ctx.accounts.blog_entry;
        blog_entry.description = new_description;
    
        Ok(())
    }
    pub fn delete_blog(ctx: Context<DeleteBlog>, title: String) -> Result<()> {
        msg!("Delete Title: {}", title);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct CreateBlog<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [b"blog", owner.key().as_ref(), title.as_bytes()],
        bump,
        space = ANCHOR_DISCRIMINATOR_SIZE + BlogEntryState::INIT_SPACE,
    )]
    pub blog_entry: Account<'info, BlogEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateBlog<'info> {
    #[account(
        mut,
        seeds = [b"blog", owner.key().as_ref(), title.as_bytes()], 
        bump,
        realloc = ANCHOR_DISCRIMINATOR_SIZE + BlogEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = false, // Keep existing data instead of clearing it
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>, // Correct system program reference
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteBlog<'info> {
    #[account( 
        mut, 
        seeds = [b"blog", owner.key().as_ref(), title.as_bytes()], 
        bump, 
        close = owner,
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)] 
pub struct BlogEntryState {
    pub owner: Pubkey,

    #[max_len(100)]
    pub title: String,

    #[max_len(500)]
    pub description: String
}