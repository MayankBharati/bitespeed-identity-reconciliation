import { Contact, LinkPrecedence } from '../models/Contact';
import { Op } from 'sequelize';

interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

interface ContactResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export class ContactService {
  async identify(data: IdentifyRequest): Promise<{ contact: ContactResponse }> {
    const { email, phoneNumber } = data;

    if (!email && !phoneNumber) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    // Find all matching contacts
    const matchingContacts = await this.findMatchingContacts(email, phoneNumber);

    if (matchingContacts.length === 0) {
      // Create new primary contact
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: LinkPrecedence.PRIMARY
      });

      return this.formatResponse([newContact]);
    }

    // Check if we need to link two primary contacts
    const primaryContacts = matchingContacts.filter(c => c.linkPrecedence === LinkPrecedence.PRIMARY);
    
    if (primaryContacts.length > 1) {
      // Convert newer primary to secondary
      await this.consolidatePrimaryContacts(primaryContacts);
      // Refresh the data
      const refreshedContacts = await this.findMatchingContacts(email, phoneNumber);
      return this.formatResponse(await this.getAllLinkedContacts(refreshedContacts));
    }

    // Check if we need to create a new secondary contact
    const needsNewContact = this.shouldCreateNewContact(matchingContacts, email, phoneNumber);
    
    if (needsNewContact) {
      const primaryContact = this.findPrimaryContact(matchingContacts);
      await Contact.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: LinkPrecedence.SECONDARY
      });
    }

    // Get all linked contacts and return response
    const allLinkedContacts = await this.getAllLinkedContacts(matchingContacts);
    return this.formatResponse(allLinkedContacts);
  }

  private async findMatchingContacts(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const conditions: any[] = [];
    
    if (email) {
      conditions.push({ email });
    }
    
    if (phoneNumber) {
      conditions.push({ phoneNumber });
    }

    return Contact.findAll({
      where: {
        [Op.or]: conditions,
        deletedAt: null
      }
    });
  }

  private async getAllLinkedContacts(contacts: Contact[]): Promise<Contact[]> {
    if (contacts.length === 0) return [];

    const primaryContact = this.findPrimaryContact(contacts);
    
    // Get all contacts linked to this primary
    const allLinked = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id }
        ],
        deletedAt: null
      }
    });

    return allLinked;
  }

  private findPrimaryContact(contacts: Contact[]): Contact {
    const primary = contacts.find(c => c.linkPrecedence === LinkPrecedence.PRIMARY);
    if (primary) return primary;

    // If no primary found, find the contact that others are linked to
    const linkedIds = contacts.map(c => c.linkedId).filter(id => id !== null);
    if (linkedIds.length > 0) {
      return Contact.findByPk(linkedIds[0]) as any;
    }

    // This shouldn't happen in normal flow
    return contacts[0];
  }

  private shouldCreateNewContact(existingContacts: Contact[], email?: string, phoneNumber?: string): boolean {
    const existingEmails = new Set(existingContacts.map(c => c.email).filter(e => e));
    const existingPhones = new Set(existingContacts.map(c => c.phoneNumber).filter(p => p));

    const hasNewEmail = email && !existingEmails.has(email);
    const hasNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

    return Boolean(hasNewEmail || hasNewPhone);
  }

  private async consolidatePrimaryContacts(primaryContacts: Contact[]): Promise<void> {
    // Sort by creation date to find the oldest
    primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const oldestPrimary = primaryContacts[0];
    const newSecondaries = primaryContacts.slice(1);

    // Update all newer primaries to secondary
    for (const contact of newSecondaries) {
      await contact.update({
        linkedId: oldestPrimary.id,
        linkPrecedence: LinkPrecedence.SECONDARY
      });

      // Also update any contacts that were linked to this primary
      await Contact.update(
        { linkedId: oldestPrimary.id },
        { where: { linkedId: contact.id } }
      );
    }
  }

  private formatResponse(contacts: Contact[]): { contact: ContactResponse } {
    const primary = contacts.find(c => c.linkPrecedence === LinkPrecedence.PRIMARY) || contacts[0];
    const secondaries = contacts.filter(c => c.linkPrecedence === LinkPrecedence.SECONDARY);

    const emails = Array.from(new Set(
      contacts
        .map(c => c.email)
        .filter(e => e)
        .sort((a, b) => {
          if (a === primary.email) return -1;
          if (b === primary.email) return 1;
          return 0;
        })
    )) as string[];

    const phoneNumbers = Array.from(new Set(
      contacts
        .map(c => c.phoneNumber)
        .filter(p => p)
        .sort((a, b) => {
          if (a === primary.phoneNumber) return -1;
          if (b === primary.phoneNumber) return 1;
          return 0;
        })
    )) as string[];

    return {
      contact: {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaries.map(s => s.id)
      }
    };
  }
}
