import { DomainStrings } from './types';

export const skillTreeStrings: DomainStrings = {
  tr: {
    skillTree: {
      title: 'Yetenekler',
      otherSkills: 'Diğer',
      backAria: 'Geri dön',
      buttons: {
        back: 'Geri',
      },
      talentBadge: 'YETENEK',
      milestones: 'Kilometre Taşları',
      modal: {
        detailSuffix: 'Detay',
        statusOpen: 'Açık',
        statusLocked: 'Kilitli',
        rewards: 'Kazanç',
      },
      skills: {
        coding: {
          title: 'Yazılım',
          milestones: {
            0: {
              text: 'Freelance İşler',
              desc: 'Basit web siteleri yaparak para kazanabilirsin.',
              benefits: {
                0: '+100$/proje kazanma',
                1: 'Evden çalışma imkanı',
              },
            },
            1: {
              text: 'Hackathon',
              desc: 'Zekâ gerektiren özel etkinlikler açılır.',
              benefits: {
                0: 'Ödüllü yarışmalar',
                1: 'Networking fırsatları',
              },
            },
            2: {
              text: 'Kıdemli Mühendis',
              desc: 'Yazılım mühendisliği kariyeri garantilenir.',
              benefits: {
                0: 'Yüksek maaşlı iş fırsatları',
                1: 'Startup kurma şansı',
              },
            },
            3: {
              text: 'Teknoloji Devi',
              desc: 'Kendi şirketini kurma potansiyeli açılır.',
              benefits: {
                0: 'Milyar dolarlık şirket kurma',
                1: 'Teknoloji lideri unvanı',
              },
            },
          },
        },
        music: {
          title: 'Müzik',
          milestones: {
            0: {
              text: 'Sokak Müziği',
              desc: 'Sokakta gitar çalarak harçlık çıkarırsın.',
              benefits: {
                0: 'Günlük harçlık kazanma',
                1: 'Karizma artışı',
              },
            },
            1: {
              text: 'Bestekar',
              desc: 'Konservatuvar teklifi alma şansı doğar.',
              benefits: {
                0: 'Müzik kariyeri yolu',
                1: 'Telif geliri',
              },
            },
            2: {
              text: 'Rockstar',
              desc: 'Dünyaca ünlü bir müzisyen olma yolu açılır.',
              benefits: {
                0: 'Konser gelirleri',
                1: 'Fan kitlesi',
              },
            },
            3: {
              text: 'Virtüöz',
              desc: 'Adını müzik tarihine yazdırırsın.',
              benefits: {
                0: 'Efsane statüsü',
                1: 'Müzik okulu acma',
              },
            },
          },
        },
        sports: {
          title: 'Spor',
          milestones: {
            0: {
              text: 'Okul Takımı',
              desc: 'Okul takımına seçilme şansı doğar.',
              benefits: {
                0: 'Popülarite artışı',
                1: 'Burs imkanı',
              },
            },
            1: {
              text: 'Kaptan',
              desc: 'Fiziksel olaylarda üstünlük sağlarsın.',
              benefits: {
                0: 'Liderlik bonusu',
                1: 'Fiziksel güç',
              },
            },
            2: {
              text: 'Milli Sporcu',
              desc: 'Olimpiyat seviyesinde kariyer yolu açılır.',
              benefits: {
                0: 'Milli gelir',
                1: 'Ülke tanınırlığı',
              },
            },
            3: {
              text: 'Efsane',
              desc: 'Spor tarihinde iz bırakırsın.',
              benefits: {
                0: 'Efsane statü',
                1: 'Spor liderliği şansı',
              },
            },
          },
        },
        athletics: {
          title: 'Atletizm',
          milestones: {
            0: {
              text: 'Dayanıklılık',
              desc: 'Spor aktivitelerinde enerji tasarrufu artar.',
              benefits: {
                0: 'Spor enerji maliyeti azalır',
                1: 'Sağlık kazanımı artar',
              },
            },
            1: {
              text: 'Formda',
              desc: 'Fiziksel dayanıklılığın üst seviyeye çıkar.',
              benefits: {
                0: 'Disiplin artışında bonus',
                1: 'Fiziksel güç artışı',
              },
            },
            2: {
              text: 'Elit Sporcu',
              desc: 'Spor kariyerlerinde zirveye yaklaşılır.',
              benefits: {
                0: 'Takım seçmelerinde avantaj',
                1: 'Spor bursu şansı',
              },
            },
          },
        },
        logic: {
          title: 'Mantık',
          milestones: {
            0: {
              text: 'Hızlı Kavrama',
              desc: 'Ders çalışırken zekâ artışı hızlanır.',
              benefits: {
                0: 'Okul zekâ artışı',
                1: 'Mat/Fen desteği',
              },
            },
            1: {
              text: 'Analitik Zihin',
              desc: 'Zor problemleri çözmek kolaylaşır.',
              benefits: {
                0: 'Sınavlarda avantaj',
                1: 'Not artışında bonus',
              },
            },
            2: {
              text: 'Stratejist',
              desc: 'Akıl oyunlarında ustalaşırsın.',
              benefits: {
                0: 'Yüksek zekâ bonusu',
                1: 'Özel etkinlikler',
              },
            },
          },
        },
        reading: {
          title: 'Okuma',
          milestones: {
            0: {
              text: 'Hızlı Okur',
              desc: 'Metinleri daha hızlı kavrarsın.',
              benefits: {
                0: 'Dil notu artışı',
                1: 'Kitap etkinlikleri',
              },
            },
            1: {
              text: 'Kültürlü',
              desc: 'Bilgi birikimin dikkat çeker.',
              benefits: {
                0: 'Sosyal diyaloglarda avantaj',
                1: 'Araştırma fırsatları',
              },
            },
            2: {
              text: 'Bilge',
              desc: 'Derin analiz yeteneği kazanırsın.',
              benefits: {
                0: 'Dil notu zirvesi',
                1: 'Özel gorevler',
              },
            },
          },
        },
        teamwork: {
          title: 'Takım',
          milestones: {
            0: {
              text: 'Uyum',
              desc: 'Takım çalışmalarında verimin artar.',
              benefits: {
                0: 'Sosyal enerji tasarrufu',
                1: 'İlişki artışı',
              },
            },
            1: {
              text: 'Kaptanlık',
              desc: 'Grup liderliğinde öne çıkarsın.',
              benefits: {
                0: 'Takım etkinliklerinde avantaj',
                1: 'Liderlik bonusu',
              },
            },
            2: {
              text: 'Birleştirici',
              desc: 'Herkesi motive eden bir rol kazanırsın.',
              benefits: {
                0: 'Yüksek ilişki artışı',
                1: 'Zor etkinliklerde başarı',
              },
            },
          },
        },
        art: {
          title: 'Sanat',
          milestones: {
            0: {
              text: 'Estetik Göz',
              desc: 'Sanat aktivitelerinde karizma artar.',
              benefits: {
                0: 'Karizma bonusu',
                1: 'Atölye etkinlikleri',
              },
            },
            1: {
              text: 'Sahne Işığı',
              desc: 'Yaratıcılığın dikkat çeker.',
              benefits: {
                0: 'Sergi fırsatı',
                1: 'Sanat etkinliklerinde bonus',
              },
            },
            2: {
              text: 'Usta Sanatçı',
              desc: 'Sanat dünyasında ün kazanırsın.',
              benefits: {
                0: 'Prestij artışı',
                1: 'Özel projeler',
              },
            },
          },
        },
        writing: {
          title: 'Yazarlık',
          milestones: {
            0: {
              text: 'Kısa Hikaye',
              desc: 'Yazma aktivitelerinde hızlanırsın.',
              benefits: {
                0: 'Yazma zekâ bonusu',
                1: 'Blog fırsatı',
              },
            },
            1: {
              text: 'Yazar',
              desc: 'Yazıların ilgi görmeye başlar.',
              benefits: {
                0: 'Yayın şansı',
                1: 'Yeni etkinlikler',
              },
            },
            2: {
              text: 'Romancı',
              desc: 'Geniş kitlelere ulaşırsın.',
              benefits: {
                0: 'Yüksek zekâ bonusu',
                1: 'Kitap teklifi',
              },
            },
          },
        },
        work_ethic: {
          title: 'Çalışkanlık',
          milestones: {
            0: {
              text: 'Düzenli',
              desc: 'Çalışma temposunu oturtursun.',
              benefits: {
                0: 'İş enerji tasarrufu',
                1: 'Gelir artışı',
              },
            },
            1: {
              text: 'Güvenilir',
              desc: 'İş yerinde tercih edilirsin.',
              benefits: {
                0: 'Terfi şansı',
                1: 'Kazanç bonusu',
              },
            },
            2: {
              text: 'Disiplin Ustası',
              desc: 'Çalışma disiplini zirveye çıkar.',
              benefits: {
                0: 'Yüksek gelir bonusu',
                1: 'Özel iş fırsatları',
              },
            },
          },
        },
        business: {
          title: 'Is',
          milestones: {
            0: {
              text: 'Pazarlıkçı',
              desc: 'Alışverişte fiyat düşürürsün.',
              benefits: {
                0: 'İndirim bonusu',
                1: 'Ek tasarruf',
              },
            },
            1: {
              text: 'Yatırımcı',
              desc: 'Para yönetiminde ilerlersin.',
              benefits: {
                0: 'Kazanç artışı',
                1: 'Yatırım fırsatları',
              },
            },
            2: {
              text: 'Girişimci',
              desc: 'Kendi işini kurma yolu açılır.',
              benefits: {
                0: 'Büyük gelir fırsatları',
                1: 'Özel etkinlikler',
              },
            },
          },
        },
        design: {
          title: 'Tasarım',
          milestones: {
            0: {
              text: 'Görsel Düşünce',
              desc: 'Tasarım işlerinde hızlanırsın.',
              benefits: {
                0: 'Tasarım karizma bonusu',
                1: 'Mini projeler',
              },
            },
            1: {
              text: 'Portfolyo',
              desc: 'Profesyonel işler gelmeye başlar.',
              benefits: {
                0: 'Freelance işler',
                1: 'Daha iyi kazanç',
              },
            },
            2: {
              text: 'Yaratıcı Yönetmen',
              desc: 'Büyük projelerde liderlik edersin.',
              benefits: {
                0: 'Prestij artışı',
                1: 'Özel projeler',
              },
            },
          },
        },
      },
    },
  },
  en: {
    skillTree: {
      title: 'Skills',
      otherSkills: 'Other',
      backAria: 'Go back',
      buttons: {
        back: 'Back',
      },
      talentBadge: 'TALENT',
      milestones: 'Milestones',
      modal: {
        detailSuffix: 'Detail',
        statusOpen: 'Open',
        statusLocked: 'Locked',
        rewards: 'Rewards',
      },
      skills: {
        coding: {
          title: 'Coding',
          milestones: {
            0: {
              text: 'Freelance Gigs',
              desc: 'You can earn money by building simple websites.',
              benefits: {
                0: '+$100 per project',
                1: 'Work-from-home option',
              },
            },
            1: {
              text: 'Hackathon',
              desc: 'Special intelligence-focused events unlock.',
              benefits: {
                0: 'Prize competitions',
                1: 'Networking opportunities',
              },
            },
            2: {
              text: 'Senior Engineer',
              desc: 'A software engineering career becomes guaranteed.',
              benefits: {
                0: 'High-paying job offers',
                1: 'Startup opportunity',
              },
            },
            3: {
              text: 'Tech Titan',
              desc: 'The path to founding your own company opens.',
              benefits: {
                0: 'Build a billion-dollar company',
                1: 'Tech leader title',
              },
            },
          },
        },
        music: {
          title: 'Music',
          milestones: {
            0: {
              text: 'Street Musician',
              desc: 'You can earn pocket money by playing guitar on the street.',
              benefits: {
                0: 'Daily pocket money',
                1: 'Charisma boost',
              },
            },
            1: {
              text: 'Composer',
              desc: 'A conservatory offer becomes possible.',
              benefits: {
                0: 'Music career path',
                1: 'Royalty income',
              },
            },
            2: {
              text: 'Rockstar',
              desc: 'The road to becoming a world-famous musician opens.',
              benefits: {
                0: 'Concert income',
                1: 'Fan base',
              },
            },
            3: {
              text: 'Virtuoso',
              desc: 'You write your name into music history.',
              benefits: {
                0: 'Legendary status',
                1: 'Open a music school',
              },
            },
          },
        },
        sports: {
          title: 'Sports',
          milestones: {
            0: {
              text: 'School Team',
              desc: 'A chance to be selected for the school team appears.',
              benefits: {
                0: 'Popularity boost',
                1: 'Scholarship opportunity',
              },
            },
            1: {
              text: 'Captain',
              desc: 'You gain an edge in physical events.',
              benefits: {
                0: 'Leadership bonus',
                1: 'Physical strength',
              },
            },
            2: {
              text: 'National Athlete',
              desc: 'An Olympic-level career path opens.',
              benefits: {
                0: 'National-level income',
                1: 'Countrywide recognition',
              },
            },
            3: {
              text: 'Legend',
              desc: 'You leave a mark on sports history.',
              benefits: {
                0: 'Legendary status',
                1: 'Sports leadership chance',
              },
            },
          },
        },
        athletics: {
          title: 'Athletics',
          milestones: {
            0: {
              text: 'Endurance',
              desc: 'Energy efficiency improves during sports activities.',
              benefits: {
                0: 'Lower sports energy cost',
                1: 'Higher health gain',
              },
            },
            1: {
              text: 'Fit',
              desc: 'Your physical endurance reaches a higher level.',
              benefits: {
                0: 'Discipline gain bonus',
                1: 'Physical strength boost',
              },
            },
            2: {
              text: 'Elite Athlete',
              desc: 'You approach the peak of sports careers.',
              benefits: {
                0: 'Advantage in team tryouts',
                1: 'Sports scholarship chance',
              },
            },
          },
        },
        logic: {
          title: 'Logic',
          milestones: {
            0: {
              text: 'Quick Learner',
              desc: 'Intelligence grows faster while studying.',
              benefits: {
                0: 'School intelligence boost',
                1: 'Math/science support',
              },
            },
            1: {
              text: 'Analytical Mind',
              desc: 'Solving difficult problems becomes easier.',
              benefits: {
                0: 'Exam advantage',
                1: 'Grade gain bonus',
              },
            },
            2: {
              text: 'Strategist',
              desc: 'You master mind games.',
              benefits: {
                0: 'High intelligence bonus',
                1: 'Special events',
              },
            },
          },
        },
        reading: {
          title: 'Reading',
          milestones: {
            0: {
              text: 'Fast Reader',
              desc: 'You understand texts more quickly.',
              benefits: {
                0: 'Language grade boost',
                1: 'Book events',
              },
            },
            1: {
              text: 'Cultured',
              desc: 'Your knowledge base stands out.',
              benefits: {
                0: 'Advantage in social dialogs',
                1: 'Research opportunities',
              },
            },
            2: {
              text: 'Sage',
              desc: 'You gain deep analytical ability.',
              benefits: {
                0: 'Peak language grades',
                1: 'Special tasks',
              },
            },
          },
        },
        teamwork: {
          title: 'Teamwork',
          milestones: {
            0: {
              text: 'Harmony',
              desc: 'Your efficiency improves in team efforts.',
              benefits: {
                0: 'Social energy savings',
                1: 'Relationship gain',
              },
            },
            1: {
              text: 'Captaincy',
              desc: 'You stand out in group leadership.',
              benefits: {
                0: 'Advantage in team events',
                1: 'Leadership bonus',
              },
            },
            2: {
              text: 'Unifier',
              desc: 'You take on a role that motivates everyone.',
              benefits: {
                0: 'High relationship gain',
                1: 'Success in hard events',
              },
            },
          },
        },
        art: {
          title: 'Art',
          milestones: {
            0: {
              text: 'Aesthetic Eye',
              desc: 'Charisma rises in art activities.',
              benefits: {
                0: 'Charisma bonus',
                1: 'Workshop events',
              },
            },
            1: {
              text: 'Spotlight',
              desc: 'Your creativity attracts attention.',
              benefits: {
                0: 'Exhibition opportunity',
                1: 'Bonus in art events',
              },
            },
            2: {
              text: 'Master Artist',
              desc: 'You gain renown in the art world.',
              benefits: {
                0: 'Prestige boost',
                1: 'Special projects',
              },
            },
          },
        },
        writing: {
          title: 'Writing',
          milestones: {
            0: {
              text: 'Short Story',
              desc: 'You speed up in writing activities.',
              benefits: {
                0: 'Writing intelligence bonus',
                1: 'Blog opportunity',
              },
            },
            1: {
              text: 'Writer',
              desc: 'Your writing starts to attract attention.',
              benefits: {
                0: 'Publishing chance',
                1: 'New events',
              },
            },
            2: {
              text: 'Novelist',
              desc: 'You reach wider audiences.',
              benefits: {
                0: 'High intelligence bonus',
                1: 'Book offer',
              },
            },
          },
        },
        work_ethic: {
          title: 'Work Ethic',
          milestones: {
            0: {
              text: 'Consistent',
              desc: 'You establish a steady work rhythm.',
              benefits: {
                0: 'Lower work energy cost',
                1: 'Income boost',
              },
            },
            1: {
              text: 'Reliable',
              desc: 'You become a preferred worker.',
              benefits: {
                0: 'Promotion chance',
                1: 'Earnings bonus',
              },
            },
            2: {
              text: 'Discipline Master',
              desc: 'Your work discipline reaches the top.',
              benefits: {
                0: 'High income bonus',
                1: 'Special job offers',
              },
            },
          },
        },
        business: {
          title: 'Business',
          milestones: {
            0: {
              text: 'Negotiator',
              desc: 'You bargain prices down while shopping.',
              benefits: {
                0: 'Discount bonus',
                1: 'Extra savings',
              },
            },
            1: {
              text: 'Investor',
              desc: 'You advance in money management.',
              benefits: {
                0: 'Income increase',
                1: 'Investment opportunities',
              },
            },
            2: {
              text: 'Entrepreneur',
              desc: 'The path to starting your own business opens.',
              benefits: {
                0: 'Big income opportunities',
                1: 'Special events',
              },
            },
          },
        },
        design: {
          title: 'Design',
          milestones: {
            0: {
              text: 'Visual Thinking',
              desc: 'You become faster at design work.',
              benefits: {
                0: 'Design charisma bonus',
                1: 'Mini projects',
              },
            },
            1: {
              text: 'Portfolio',
              desc: 'Professional work starts to come your way.',
              benefits: {
                0: 'Freelance jobs',
                1: 'Better income',
              },
            },
            2: {
              text: 'Creative Director',
              desc: 'You lead major projects.',
              benefits: {
                0: 'Prestige boost',
                1: 'Special projects',
              },
            },
          },
        },
      },
    },
  },
};
