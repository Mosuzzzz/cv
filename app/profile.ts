import certificates from "./certificates.json";

export type Experience = { dates: string; company: string; title: string; detail?: string };

export const profile = {
  name: "Patiphan Chaiyakhun",
  nickname: "Mosu",
  role: "also known as Mosu",
  intro: "I'm studying Computer Science at RMUTI Korat, with a strong interest in networking and DevOps.",
  location: "",
  email: "devpatiphan@gmail.com",
  bookingUrl: "",
  github: "https://github.com/Mosuzzzz",
  githubUsername: "Mosuzzzz",
  featuredRepos: [
    { name: "Avengers-Assemble", summary: "An Internet Programming course project." },
    { name: "Institute_X", summary: "An online learning system for a vocational school, with courses, assessments, and role-based workspaces." },
    { name: "restock-switch-tool", summary: "A Minecraft Fabric mod that refills used items and selects the right tool from the hotbar." },
    { name: "mockExam", summary: "A browser-based practice exam tool with timed tests, answer reviews, and local attempt history." },
    { name: "social_security_motocycle", summary: "A TypeScript project with separate frontend and backend applications." },
  ],
  certificates,
  linkedin: "",
  experience: [] as Experience[],
};
