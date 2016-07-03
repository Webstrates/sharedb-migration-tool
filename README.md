# Migration script from MongoDB ShareJS to ShareDB

As a consequence of [Webstrates](github.com/cklokmose/Webstrates) replacing [ShareJS](https://github.com/share/ShareJS)
with [ShareDB](https://github.com/share/sharedb), users will have to migrate their MongoDB databases in order to still
use the prototyping and versioning functionality og Webstrates. Without migrating the databases, creating and accessing
snapshots will still be possible.

## FAQ
**How do I use this?**
1. [Take a backup of your database](https://docs.mongodb.com/v3.0/tutorial/backup-and-restore-tools/).
2. Clone this repository.
3. Open `index.js` and modify `url` to point to your database.
4. Run

       npm install
       npm start

**Is this script only for Webstrates?**  \
No. The migration script was written with Webstrates in mind, but it _should_ work for any LiveDB/ShareDB database
migration.

**Do I need this?**  \
If you rely on using the oplogs created with ShareJS for your ShareDB application, then the answer is yes. If not, you
can safely skip migration.

**This script is really slow!**  \
Yes. When testing the script on alarge database (about 15GB), Node would consistently run out of memory. The script
therefore no longer uses bulk operations. As a consequence, the migration may take a long time.

**The script crashed, my computer went to sleep or I cancelled it. What now?**  \
The script is idempotent in the sense that running it multiple times on the same database won't do any harm. Likewise,
if only part of your database was migrated before the script terminated, you can just run it again and the script will
clean up and pick up from where it left off.

**I'm getting an error: Unable to migrate <doc> (MongoError: <key> <error>)**  \
Something went wrong with a particular document, most likely because some invalid key name previously has managed to
make its way into the database, but is now being confronted. We already try to fix this by replacing dots with double
underscores (`.` becomes `__`) in key names, but some invalid names may still have slipped us by. The document's op log
therefore has not been migrated. The snapshots (newest versions) of the unmigrated documents will still be accessible.

## Disclaimer
THE PROGRAM IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL, BUT WITHOUT ANY WARRANTY. IT IS PROVIDED "AS IS" WITHOUT
WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW THE AUTHOR WILL BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY GENERAL,
SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT
LIMITED TO LOSS OF DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD PARTIES OR A FAILURE OF
THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS), EVEN IF THE AUTHOR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.