import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const TABLES = [

  'players',

  'teams',

  'top_goal',

  'game1predictions',

  'game1_results',

  'game2matches',

  'game2predictions'

]

export async function GET() {

  try {

    const backup: Record<string, any> = {

      exported_at:
        new Date().toISOString(),

      version:
        'SFNBETS2026',

      tables: {}

    }

    for (const table of TABLES) {

      const {
        data,
        error
      } = await supabase
        .from(table)
        .select('*')

      if (error)
        throw error

      backup.tables[table] =
        data

    }

const fileName =
  `sfnbets-backup-${
    new Date()
      .toISOString()
      .slice(0, 10)
  }.json`

return new Response(

  JSON.stringify(
    backup,
    null,
    2
  ),

  {

    headers: {

      'Content-Type':
        'application/json',

      'Content-Disposition':
        `attachment; filename="${fileName}"`

    }

  }

)

  } catch (error) {

    console.error(
      'BACKUP ERROR:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        error
      },
      {
        status: 500
      }
    )
  }
}