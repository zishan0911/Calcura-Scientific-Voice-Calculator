const SystemSettings =
    require("../models/SystemSettings");


/* =========================================================
   GET SYSTEM SETTINGS
========================================================= */

const getSystemSettings =
    async (req, res) => {

        try {

            let settings =
                await SystemSettings
                    .findOne()
                    .lean();


            if (!settings) {

                settings =
                    await SystemSettings.create({
                        updatedBy:
                            req.user?._id || null
                    });

                settings =
                    settings.toObject();

            }


            return res.status(200).json({

                success: true,

                settings

            });

        }

        catch (error) {

            console.error(
                "GET SYSTEM SETTINGS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to load system settings"

            });

        }

    };


/* =========================================================
   UPDATE SYSTEM SETTINGS
========================================================= */

const updateSystemSettings =
    async (req, res) => {

        try {

            const data =
                req.body || {};


            const allowedFields = [

                "websiteName",
                "websiteURL",
                "contactEmail",
                "supportEmail",
                "timezone",
                "defaultLanguage",

                "twoFactor",
                "loginLimit",
                "loginLimitEnabled",
                "sessionTimeout",
                "ipWhitelist",
                "activityLogging",

                "smtpHost",
                "smtpPort",
                "smtpUsername",
                "smtpPassword",
                "fromEmail",
                "fromName",

                "registrationEmails",
                "subscriptionEmails",
                "systemAlerts",

                "paymentGateway",
                "razorpayKey",
                "currency",
                "planDuration",

                "enableSubscriptions",
                "enableFreePlan",
                "autoRenew",

                "strongPasswords",
                "security2FA",
                "sessionProtection",
                "securityAlerts",

                "emailRegistrationTab",
                "emailSubscriptionTab",
                "emailSystemTab",

                "adminTheme",
                "accentColor",

                "googleIntegration",
                "emailIntegration",
                "paymentIntegration"

            ];


            const updateData = {};


            allowedFields.forEach(
                field => {

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                data,
                                field
                            )
                    ) {

                        updateData[field] =
                            data[field];

                    }

                }
            );


            if (req.user?._id) {

                updateData.updatedBy =
                    req.user._id;

            }


            const settings =
                await SystemSettings.findOneAndUpdate(
                    {},
                    {
                        $set:
                            updateData
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                ).lean();


            return res.status(200).json({

                success: true,

                message:
                    "System settings updated successfully.",

                settings

            });

        }

        catch (error) {

            console.error(
                "UPDATE SYSTEM SETTINGS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to update system settings"

            });

        }

    };


module.exports = {

    getSystemSettings,

    updateSystemSettings

};