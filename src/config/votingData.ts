/**
 * Voting data for the BUSA Great Gatsby Gala Awards.
 * Each category contains the finalists selected from nominations.
 */

export interface VotingNominee {
  name: string
}

export interface VotingCategory {
  /** Must match the DB award_categories.name exactly */
  name: string
  nominees: VotingNominee[]
}

export interface VotingGroup {
  type: string
  name: string

  categories: VotingCategory[]
}

export const VOTING_GROUPS: VotingGroup[] = [
  {
    type: "social",
    name: "Social Awards",

    categories: [
      {
        name: "Freshest Fresher of the Year",
        nominees: [
          { name: "Kalejaye Mozeedah Opeyemi" },
          { name: "Bamidele" },
          { name: "Blessing Eke" },
          { name: "Omofomah Alexis Chukwuyem" },
          { name: "Olubiyi Quam Akorode" },
        ],
      },
      {
        name: "Most Fashionable (Female)",
        nominees: [
          { name: "Markson Magdalene" },
          { name: "Odikagbue Temidun" },
          { name: "Nyah Cecilia" },
          { name: "Eniola" },
          { name: "Nhiella" },
        ],
      },
      {
        name: "Most Fashionable (Male)",
        nominees: [
          { name: "Adeyemi Adeoye" },
          { name: "Frank Cleave Kasimanwuna" },
          { name: "Toju Laid-Williams" },
          { name: "Damilola" },
          { name: "Savior Edward" },
        ],
      },
      {
        name: "Rookie of the Year",
        nominees: [
          { name: "Kalejaye Mozeedah Opeyemi" },
          { name: "Emmanuella Agu" },
          { name: "Onosoya Taiwo" },
          { name: "Eke Blessing" },
          { name: "Treasure" },
        ],
      },
      {
        name: "Most Influential (Female)",
        nominees: [
          { name: "Ogunniyi Hafsoh" },
          { name: "Pretty Steph" },
          { name: "Abagun Okikiola" },
          { name: "Anurika Divine" },
          { name: "Yussuf Mariam" },
        ],
      },
      {
        name: "Most Influential (Male)",
        nominees: [
          { name: "Falola Boluwatife (Uncle Bolu)" },
          { name: "Frank Cleave Kasimanwuna" },
          { name: "Olowo Covenant" },
          { name: "Okiki Imole" },
          { name: "Teslim" },
        ],
      },
      {
        name: "Most Popular (Male)",
        nominees: [
          { name: "Okiki Imole" },
          { name: "Adekunle Daniel (Bunda)" },
          { name: "Mario" },
          { name: "Oluwagbotemi Adebayo" },
          { name: "Lukman Teslim" },
        ],
      },
      {
        name: "Most Popular (Female)",
        nominees: [
          { name: "Esther Ogunleye" },
          { name: "Ogunniyi Hafsoh" },
          { name: "Odikagbue Temidun" },
          { name: "Ikenwe Vanessa Kamsiyochukwu (Nessarose)" },
          { name: "Pretty Stephee" },
        ],
      },
      {
        name: "Spotlight Award",
        nominees: [
          { name: "Falola Boluwatife (Uncle Bolu)" },
          { name: "Damilola" },
          { name: "Lukman Teslim" },
          { name: "Sanni Samiat" },
          { name: "Phoebe Arome" },
        ],
      },
      {
        name: "Most Sociable (Male)",
        nominees: [
          { name: "Falola Boluwatife (Uncle Bolu)" },
          { name: "Okonkwo Prince (Prince K)" },
          { name: "Justin" },
          { name: "Oluwagbotemi Adebayo (GECHO)" },
          { name: "Okiki Imole" },
        ],
      },
      {
        name: "Most Sociable (Female)",
        nominees: [
          { name: "Eke Amarachi" },
          { name: "Ogunniyi Hafsoh" },
          { name: "Olatunji Feyisayo (Akínkanjú)" },
          { name: "Ikenwe Vanessa Kamsiyochukwu (Nessarose)" },
          { name: "Miracle Felix Malachy (Chiquita)" },
        ],
      },
      {
        name: "Clique of the Year",
        nominees: [
          { name: "Amarachi and Gang (The Aura)" },
          { name: "Top Members" },
          { name: "Retiring Before 30" },
          { name: "Bam Bam and Co" },
          { name: "Room Boyz" },
        ],
      },
    ],
  },
  {
    type: "entertainment",
    name: "Entertainment Awards",

    categories: [
      {
        name: "Icon 360",
        nominees: [
          { name: "Falola Boluwatife (Uncle Bolu)" },
          { name: "Adewuyi David" },
          { name: "Lukman Teslim" },
          { name: "Arome Phoebe" },
        ],
      },
      {
        name: "Artiste of the Year",
        nominees: [
          { name: "Tk X" },
          { name: "Jab (Tumi)" },
          { name: "Fk" },
          { name: "Cheddy" },
          { name: "Aniel" },
        ],
      },
      {
        name: "Talent of the Year",
        nominees: [
          { name: "Okeiukwu Anthony-Mario" },
          { name: "Oluwagbotemi Adebayo" },
          { name: "Ebun & Zanny" },
          { name: "Arome Phoebe" },
          { name: "Tonye" },
        ],
      },
      {
        name: "Content Creator of the Year",
        nominees: [
          { name: "Pretty Stephee" },
          { name: "Miracle Felix Malachy (Chiquita)" },
          { name: "Odikagbue Temidun" },
          { name: "Okeiukwu Anthony-Mario" },
          { name: "Anurika Divine" },
        ],
      },
      {
        name: "DJ / Music Producer of the Year",
        nominees: [
          { name: "Dj Gecho" },
          { name: "Dj Remix" },
          { name: "Kuspid" },
          { name: "Joseph" },
          { name: "Dj Papa" },
        ],
      },
      {
        name: "Next Rated",
        nominees: [
          { name: "Onasanya Taiwo" },
          { name: "Kalejaye Mazeedah Opeyemi" },
          { name: "Ace" },
          { name: "Bambam" },
          { name: "Omofomoh Alexis Chukwuyem" },
        ],
      },
    ],
  },
  {
    type: "innovation",
    name: "Innovation Awards",

    categories: [
      {
        name: "Entrepreneur of the Year",
        nominees: [
          { name: "Bibi's Hut" },
          { name: "Esscentials" },
          { name: "Hope" },
          { name: "Siberia" },
          { name: "Winston Stores" },
        ],
      },
      {
        name: "Innovation of the Year",
        nominees: [
          { name: "Brixsports" },
          { name: "Natada" },
          { name: "Tobi Bankole" },
          { name: "Udoh Joseph (Investor)" },
          { name: "Starkmarts" },
        ],
      },
      {
        name: "Brand of the Year",
        nominees: [
          { name: "Biba's Cosmetics" },
          { name: "Space Worm" },
          { name: "Hope" },
          { name: "Winston Island" },
          { name: "Bastiluxxe" },
        ],
      },
    ],
  },
  {
    type: "sports",
    name: "Sports Awards",

    categories: [
      {
        name: "Sports Personality (Male)",
        nominees: [
          { name: "Ireoluwa Oke" },
          { name: "Okiki" },
          { name: "Adekunle Daniel" },
          { name: "Animashaun Oluwanifemi" },
          { name: "Andrew" },
        ],
      },
      {
        name: "Sports Personality (Female)",
        nominees: [
          { name: "Ariyibi Precious (Scorpy)" },
          { name: "Mariam Yussuf" },
          { name: "Odikagbue Temidun" },
          { name: "Kanna Blossom" },
          { name: "Ayo-Ponle Pipolola" },
        ],
      },
      {
        name: "Footballer of the Year (Male)",
        nominees: [
          { name: "Kedem" },
          { name: "Sammy" },
          { name: "Reward" },
          { name: "Jess" },
          { name: "Emememe" },
        ],
      },
      {
        name: "Footballer of the Year (Female)",
        nominees: [
          { name: "Ariyibi Precious (Scorpy)" },
          { name: "Esther Ogunleye" },
          { name: "Ayo-Ponle Pipolola" },
          { name: "Okuofu Stephanie" },
          { name: "Ojutalayo Olufela" },
        ],
      },
      {
        name: "Basketball Player of the Year (Female)",
        nominees: [
          { name: "Ebugosi Ruth" },
          { name: "Olusanya Korede" },
          { name: "Rehan Sadiq" },
          { name: "Mofe Oyebanji" },
          { name: "Pascalyn" },
        ],
      },
      {
        name: "Basketball Player of the Year (Male)",
        nominees: [
          { name: "Juba" },
          { name: "Salimo" },
          { name: "David" },
          { name: "Kosi" },
          { name: "Fred" },
        ],
      },
    ],
  },
  {
    type: "creative",
    name: "Creative Awards",

    categories: [
      {
        name: "Photographer of the Year",
        nominees: [
          { name: "Abodunrin Mofeyintoluwa (Mofethegrapher)" },
          { name: "Ademehin Oluwaseun (Tech Boy)" },
          { name: "Jomi" },
          { name: "Sogbola Micheal (SG)" },
          { name: "Temisaren David (Davidshotit)" },
        ],
      },
      {
        name: "Graphic Designer of the Year",
        nominees: [
          { name: "Uchenna Obinta (Uche the Designer)" },
          { name: "Adesanya Olurunnifemi (Niffy Graphics)" },
          { name: "Olusomo Emmanuel (The Creative Odyssey)" },
          { name: "Jahwin James" },
          { name: "Bolaji Folajimi" },
        ],
      },
      {
        name: "Videographer of the Year",
        nominees: [
          { name: "Joel Atuh (Jay)" },
          { name: "Ademehin Oluwaseun (Tech Boy)" },
          { name: "Tolu Centric" },
          { name: "Enoch Oguntoye" },
          { name: "Frank Cleave Kasimanwuna" },
        ],
      },
    ],
  },
  {
    type: "leadership",
    name: "Leadership Awards",

    categories: [
      {
        name: "Academic Excellence Award",
        nominees: [
          { name: "Abdulbasit Fasasi" },
          { name: "Ebun Olatunji" },
          { name: "Esther Ogunleye" },
          { name: "Kafayat Lawal" },
          { name: "Itua David" },
        ],
      },
      {
        name: "Most Outstanding Student of the Year",
        nominees: [
          { name: "Adewuyi David" },
          { name: "Ehijene Joan Aisosa" },
          { name: "Abdulbasit Fasasi" },
          { name: "Arome Phoebe" },
          { name: "Olowo Covenant" },
        ],
      },
      {
        name: "Distinguished Executive (Female)",
        nominees: [
          { name: "Ogunleye Esther" },
          { name: "Bibire Adumadeyin" },
          { name: "Ayo-Ponle Pipolola" },
          { name: "Olatunji Feyisayo" },
        ],
      },
      {
        name: "Distinguished Executive (Male)",
        nominees: [
          { name: "Olowo Covenant" },
          { name: "Frank Cleave Kasimanwuna" },
          { name: "Ireoluwa Oke" },
          { name: "Olisa Churchill" },
          { name: "Atuh Joel" },
          { name: "Oluwagbotemi Adebayo" },
        ],
      },
      {
        name: "Lecturer of the Year",
        nominees: [
          { name: "Dr. Sangotola (COLNAS)" },
          { name: "Dr. Thongo (COLMANS)" },
          { name: "Dr. Olanipekun (COLENG)" },
          { name: "Dr. Dudu (COLFAST)" },
          { name: "Arch. John (COLENVS)" },
          { name: "Dr. Micheal (COLCOM)" },
        ],
      },
    ],
  },
]

/** Total number of categories across all groups */
export const TOTAL_CATEGORIES = VOTING_GROUPS.reduce(
  (sum, g) => sum + g.categories.length,
  0
)
