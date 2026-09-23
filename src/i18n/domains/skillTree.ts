import { DomainStrings } from './types';

export const skillTreeStrings: DomainStrings = {
  tr: {
    skillTree: {
      title: 'Yetenekler',
      otherSkills: 'Diger',
      backAria: 'Geri don',
      buttons: {
        back: 'Geri',
      },
      talentBadge: 'YETENEK',
      milestones: 'Kilometre Taslari',
      modal: {
        detailSuffix: 'Detay',
        statusOpen: 'Açık',
        statusLocked: 'Kilitli',
        rewards: 'Kazanc',
      },
      skills: {
        coding: {
          title: 'Yazilim',
          milestones: {
            0: {
              text: 'Freelance Isler',
              desc: 'Basit web siteleri yaparak para kazanabilirsin.',
              benefits: {
                0: '+100$/proje kazanma',
                1: 'Evden calisma imkani',
              },
            },
            1: {
              text: 'Hackathon',
              desc: 'Zekâ gerektiren özel etkinlikler açılır.',
              benefits: {
                0: 'Odullu yarismalar',
                1: 'Networking firsatlari',
              },
            },
            2: {
              text: 'Kidemli Muhendis',
              desc: 'Yazilim muhendisligi kariyeri garantilenir.',
              benefits: {
                0: 'Yuksek maasli is firsatlari',
                1: 'Startup kurma sansi',
              },
            },
            3: {
              text: 'Teknoloji Devi',
              desc: 'Kendi sirketini kurma potansiyeli açılır.',
              benefits: {
                0: 'Milyar dolarlik sirket kurma',
                1: 'Teknoloji lideri unvani',
              },
            },
          },
        },
        music: {
          title: 'Müzik',
          milestones: {
            0: {
              text: 'Sokak Muzigi',
              desc: 'Sokakta gitar calarak harclik cikarirsin.',
              benefits: {
                0: 'Gunluk harclik kazanma',
                1: 'Karizma artisi',
              },
            },
            1: {
              text: 'Bestekar',
              desc: 'Konservatuvar teklifi alma sansi dogar.',
              benefits: {
                0: 'Müzik kariyeri yolu',
                1: 'Telif geliri',
              },
            },
            2: {
              text: 'Rockstar',
              desc: 'Dunyaca unlu bir muzisyen olma yolu açılır.',
              benefits: {
                0: 'Konser gelirleri',
                1: 'Fan kitlesi',
              },
            },
            3: {
              text: 'Virtuoz',
              desc: 'Adini müzik tarihine yazdirirsin.',
              benefits: {
                0: 'Efsane statusu',
                1: 'Müzik okulu acma',
              },
            },
          },
        },
        sports: {
          title: 'Spor',
          milestones: {
            0: {
              text: 'Okul Takimi',
              desc: 'Okul takimina secilme sansi dogar.',
              benefits: {
                0: 'Popularite artisi',
                1: 'Burs imkani',
              },
            },
            1: {
              text: 'Kaptan',
              desc: 'Fiziksel olaylarda ustunluk saglarsin.',
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
                1: 'Ulke taninirligi',
              },
            },
            3: {
              text: 'Efsane',
              desc: 'Spor tarihinde iz birakirsin.',
              benefits: {
                0: 'Efsane statu',
                1: 'Spor liderligi sansi',
              },
            },
          },
        },
        athletics: {
          title: 'Atletizm',
          milestones: {
            0: {
              text: 'Dayaniklilik',
              desc: 'Spor aktivitelerinde enerji tasarrufu artar.',
              benefits: {
                0: 'Spor enerji maliyeti azalir',
                1: 'Sağlık kazanimi artar',
              },
            },
            1: {
              text: 'Formda',
              desc: 'Fiziksel dayanikliligin ust seviyeye çıkar.',
              benefits: {
                0: 'Disiplin artisinda bonus',
                1: 'Fiziksel güç artisi',
              },
            },
            2: {
              text: 'Elit Sporcu',
              desc: 'Spor kariyerlerinde zirveye yaklasilir.',
              benefits: {
                0: 'Takim secmelerinde avantaj',
                1: 'Spor bursu sansi',
              },
            },
          },
        },
        logic: {
          title: 'Mantik',
          milestones: {
            0: {
              text: 'Hizli Kavrama',
              desc: 'Ders calisirken zekâ artisi hizlanir.',
              benefits: {
                0: 'Okul zekâ artisi',
                1: 'Mat/Fen destegi',
              },
            },
            1: {
              text: 'Analitik Zihin',
              desc: 'Zor problemleri cozmek kolaylasir.',
              benefits: {
                0: 'Sinavlarda avantaj',
                1: 'Not artisinda bonus',
              },
            },
            2: {
              text: 'Stratejist',
              desc: 'Akil oyunlarinda ustalasirsin.',
              benefits: {
                0: 'Yuksek zekâ bonusu',
                1: 'Özel etkinlikler',
              },
            },
          },
        },
        reading: {
          title: 'Okuma',
          milestones: {
            0: {
              text: 'Hizli Okur',
              desc: 'Metinleri daha hizli kavrarsin.',
              benefits: {
                0: 'Dil notu artisi',
                1: 'Kitap etkinlikleri',
              },
            },
            1: {
              text: 'Kulturlu',
              desc: 'Bilgi birikimin dikkat ceker.',
              benefits: {
                0: 'Sosyal diyaloglarda avantaj',
                1: 'Arastirma firsatlari',
              },
            },
            2: {
              text: 'Bilge',
              desc: 'Derin analiz yetenegi kazanirsin.',
              benefits: {
                0: 'Dil notu zirvesi',
                1: 'Özel gorevler',
              },
            },
          },
        },
        teamwork: {
          title: 'Takim',
          milestones: {
            0: {
              text: 'Uyum',
              desc: 'Takim calismalarinda verimin artar.',
              benefits: {
                0: 'Sosyal enerji tasarrufu',
                1: 'İlişki artisi',
              },
            },
            1: {
              text: 'Kaptanlik',
              desc: 'Grup liderliginde one cikarsin.',
              benefits: {
                0: 'Takim etkinliklerinde avantaj',
                1: 'Liderlik bonusu',
              },
            },
            2: {
              text: 'Birlestirici',
              desc: 'Herkesi motive eden bir rol kazanirsin.',
              benefits: {
                0: 'Yuksek ilişki artisi',
                1: 'Zor etkinliklerde basari',
              },
            },
          },
        },
        art: {
          title: 'Sanat',
          milestones: {
            0: {
              text: 'Estetik Goz',
              desc: 'Sanat aktivitelerinde karizma artar.',
              benefits: {
                0: 'Karizma bonusu',
                1: 'Atolye etkinlikleri',
              },
            },
            1: {
              text: 'Sahne Isigi',
              desc: 'Yaraticiligin dikkat ceker.',
              benefits: {
                0: 'Sergi firsati',
                1: 'Sanat etkinliklerinde bonus',
              },
            },
            2: {
              text: 'Usta Sanatci',
              desc: 'Sanat dunyasinda un kazanirsin.',
              benefits: {
                0: 'Prestij artisi',
                1: 'Özel projeler',
              },
            },
          },
        },
        writing: {
          title: 'Yazarlik',
          milestones: {
            0: {
              text: 'Kisa Hikaye',
              desc: 'Yazma aktivitelerinde hizlanirsin.',
              benefits: {
                0: 'Yazma zekâ bonusu',
                1: 'Blog firsati',
              },
            },
            1: {
              text: 'Yazar',
              desc: 'Yazilarin ilgi gormeye baslar.',
              benefits: {
                0: 'Yayin sansi',
                1: 'Yeni etkinlikler',
              },
            },
            2: {
              text: 'Romanci',
              desc: 'Genis kitlelere ulasirsin.',
              benefits: {
                0: 'Yuksek zekâ bonusu',
                1: 'Kitap teklifi',
              },
            },
          },
        },
        work_ethic: {
          title: 'Caliskanlik',
          milestones: {
            0: {
              text: 'Duzenli',
              desc: 'Calisma temposunu oturtursun.',
              benefits: {
                0: 'Is enerji tasarrufu',
                1: 'Gelir artisi',
              },
            },
            1: {
              text: 'Guvenilir',
              desc: 'Is yerinde tercih edilirsin.',
              benefits: {
                0: 'Terfi sansi',
                1: 'Kazanc bonusu',
              },
            },
            2: {
              text: 'Disiplin Ustasi',
              desc: 'Calisma disiplini zirveye çıkar.',
              benefits: {
                0: 'Yuksek gelir bonusu',
                1: 'Özel is firsatlari',
              },
            },
          },
        },
        business: {
          title: 'Is',
          milestones: {
            0: {
              text: 'Pazarlikci',
              desc: 'Alisveriste fiyat dusurursun.',
              benefits: {
                0: 'Indirim bonusu',
                1: 'Ek tasarruf',
              },
            },
            1: {
              text: 'Yatirimci',
              desc: 'Para yonetiminde ilerlersin.',
              benefits: {
                0: 'Kazanc artisi',
                1: 'Yatirim firsatlari',
              },
            },
            2: {
              text: 'Girisimci',
              desc: 'Kendi isini kurma yolu açılır.',
              benefits: {
                0: 'Büyük gelir firsatlari',
                1: 'Özel etkinlikler',
              },
            },
          },
        },
        design: {
          title: 'Tasarim',
          milestones: {
            0: {
              text: 'Görsel Dusunce',
              desc: 'Tasarim islerinde hizlanirsin.',
              benefits: {
                0: 'Tasarim karizma bonusu',
                1: 'Mini projeler',
              },
            },
            1: {
              text: 'Portfolyo',
              desc: 'Profesyonel isler gelmeye baslar.',
              benefits: {
                0: 'Freelance isler',
                1: 'Daha iyi kazanc',
              },
            },
            2: {
              text: 'Yaratici Yonetmen',
              desc: 'Büyük projelerde liderlik edersin.',
              benefits: {
                0: 'Prestij artisi',
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
