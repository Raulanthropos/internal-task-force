import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            "app": {
                "title": "Motion Hellas PCS"
            },
            "login": {
                "title": "Login",
                "username": "Username",
                "password": "Password",
                "signin": "Sign In",
                "error": "Invalid credentials",
                "loading": "Signing in..."
            },
            "dashboard": {
                "title": "Dashboard",
                "welcome": "Welcome, {{username}}",
                "logout": "Logout",
                "no_projects": "No projects found."
            },
            "common": {
                "project": "Project",
                "scope": "Scope",
                "team": "Team",
                "client": "Client",
                "status": "Status",
                "tickets": "Tickets",
                "no_tickets": "No tickets",
                "no_scopes": "No scopes visible for your team."
            },
            "teams": {
                "SOFTWARE": "Software",
                "STRUCTURAL": "Structural",
                "ELECTRICAL": "Electrical",
                "ENVIRONMENTAL": "Environmental"
            },
            "roles": {
                "ADMIN": "Admin",
                "LEAD": "Lead",
                "ENGINEER": "Engineer"
            },
            "actions": {
                "toggle_language": "Change Language"
            }
        }
    },
    el: {
        translation: {
            "app": {
                "title": "Motion Hellas PCS"
            },
            "login": {
                "title": "Σύνδεση",
                "username": "Όνομα Χρήστη",
                "password": "Κωδικός",
                "signin": "Είσοδος",
                "error": "Λάθος στοιχεία",
                "loading": "Σύνδεση..."
            },
            "dashboard": {
                "title": "Πίνακας Ελέγχου",
                "welcome": "Καλώς ήρθατε, {{username}}",
                "logout": "Αποσύνδεση",
                "no_projects": "Δεν βρέθηκαν έργα."
            },
            "common": {
                "project": "Έργο",
                "scope": "Πεδίο Εφαρμογής",
                "team": "Ομάδα",
                "client": "Πελάτης",
                "status": "Κατάσταση",
                "tickets": "Δελτία",
                "no_tickets": "Χωρίς δελτία",
                "no_scopes": "Δεν υπάρχουν ορατά πεδία για την ομάδα σας."
            },
            "teams": {
                "SOFTWARE": "Λογισμικού",
                "STRUCTURAL": "Δομικών",
                "ELECTRICAL": "Ηλεκτρολογικών",
                "ENVIRONMENTAL": "Περιβαλλοντικών"
            },
            "roles": {
                "ADMIN": "Διαχειριστής",
                "LEAD": "Επικεφαλής",
                "ENGINEER": "Μηχανικός"
            },
            "actions": {
                "toggle_language": "Αλλαγή Γλώσσας"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
